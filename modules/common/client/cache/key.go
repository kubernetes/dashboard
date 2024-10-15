package cache

import (
	"io"
	"net/http"

	"github.com/Yiling-J/theine-go"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/dashboard/client/args"
	"k8s.io/dashboard/helpers"
	"k8s.io/dashboard/types"
	"k8s.io/klog/v2"
)

var contextCache *theine.Cache[string, string]

type key struct {
	Kind      types.ResourceKind
	Namespace string
	Opts      metav1.ListOptions
}

func (k key) SHA() (string, error) {
	k.Opts = metav1.ListOptions{LabelSelector: k.Opts.LabelSelector, FieldSelector: k.Opts.FieldSelector}
	return helpers.HashObject(k)
}

type Key struct {
	key
	Token   string
	context string
}

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
