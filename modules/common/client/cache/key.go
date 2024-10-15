package cache

import (
	"io"
	"net/http"

	"github.com/Yiling-J/theine-go"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/klog/v2"

	"k8s.io/dashboard/client/args"
	"k8s.io/dashboard/helpers"
	"k8s.io/dashboard/types"
)

// contextCache is used when `cluster-context-enabled=true`. It maps
// a token to the context ID. It is used only when client needs to cache
// multi-cluster resources.
var contextCache *theine.Cache[string, string]

// key is an internal structure used for creating
// a unique cache key SHA. It is used when
// `cluster-context-enabled=false`.
type key struct {
	// Kind is a kubernetes resource kind
	Kind types.ResourceKind

	// Namespaces is a kubernetes resource namespace
	Namespace string

	// Opts is a list options object used by the kubernetes client.
	Opts metav1.ListOptions
}

// SHA calculates sha based on the internal key fields.
func (k key) SHA() (string, error) {
	k.Opts = metav1.ListOptions{LabelSelector: k.Opts.LabelSelector, FieldSelector: k.Opts.FieldSelector}
	return helpers.HashObject(k)
}

// Key embeds an internal key structure and extends it with the support
// for the multi-cluster cache key creation. It is used when
// `cluster-context-enabled=true`.
type Key struct {
	key

	// Token is an auth token used to exchange it for the context ID.
	Token string

	// context is an internal identifier used in conjunction with the key
	// structure fields to create a cache key SHA that will be unique across
	// all clusters.
	context string
}

// SHA calculates sha based on the internal struct fields.
// It is also responsible for exchanging the [Key.Token] for
// the context identifier with the external source of truth
// configured via `token-exchange-endpoint` flag.
func (k Key) SHA() (sha string, err error) {
	if !args.ClusterContextEnabled() {
		return k.key.SHA()
	}

	contextKey, exists := contextCache.Get(k.Token)
	if !exists {
		contextKey, err = exchangeToken(k.Token)
		if err != nil {
			return "", err
		}

		contextCache.SetWithTTL(k.Token, contextKey, 1, args.CacheTTL())
	}

	k.Opts = metav1.ListOptions{LabelSelector: k.Opts.LabelSelector, FieldSelector: k.Opts.FieldSelector}
	k.Token = ""
	k.context = contextKey
	return helpers.HashObject(k)
}

// NewKey creates a new cache Key.
func NewKey(kind types.ResourceKind, namespace, token string, opts metav1.ListOptions) Key {
	return Key{
		key:   key{Kind: kind, Namespace: namespace, Opts: opts},
		Token: token,
	}
}

type tokenExchangeTransport struct {
	token     string
	transport http.RoundTripper
}

func (in *tokenExchangeTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	req.Header.Set("Authorization", "Bearer "+in.token)
	return in.transport.RoundTrip(req)
}

func exchangeToken(token string) (string, error) {
	client := &http.Client{Transport: &tokenExchangeTransport{
		token:     token,
		transport: http.DefaultTransport,
	}}

	response, err := client.Get(args.TokenExchangeEndpoint())
	if err != nil {
		return "", err
	}

	defer response.Body.Close()
	contextKey, err := io.ReadAll(response.Body)
	if err != nil {
		return "", err
	}

	klog.V(3).InfoS("token exchange successful", "context", contextKey)
	return string(contextKey), nil
}
