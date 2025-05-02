// Copyright 2017 The Kubernetes Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package cache

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/Yiling-J/theine-go"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/klog/v2"

	"k8s.io/dashboard/client/args"
	"k8s.io/dashboard/errors"
	"k8s.io/dashboard/helpers"
	"k8s.io/dashboard/types"
)

// contextCache is used in multi-cluster setup to map tokens to context (cluster) identifiers.
// Multi-cluster setup is enabled by providing `cluster-context-enabled=true` argument.
var contextCache *theine.Cache[string, string]

func init() {
	var err error
	if contextCache, err = theine.NewBuilder[string, string](int64(args.CacheSize())).Build(); err != nil {
		panic(err)
	}
}

// key used in cache as request identifier in single-cluster setup.
// In multi-cluster setup Key is used instead.
type key struct {
	// kind is a Kubernetes resource kind.
	kind types.ResourceKind

	// namespace is a Kubernetes resource namespace.
	namespace string

	// opts is a list options object used by the Kubernetes client.
	opts metav1.ListOptions
}

// SHA calculates key SHA based on its internal fields.
func (k key) SHA() (string, error) {
	return helpers.HashObject(k)
}

// MarshalJSON is a custom marshall implementation that allows to marshall internal key fields.
// It is required during SHA calculation.
func (k key) MarshalJSON() ([]byte, error) {
	return json.Marshal(struct {
		Kind      types.ResourceKind
		Namespace string
		Opts      metav1.ListOptions
	}{
		Kind:      k.kind,
		Namespace: k.namespace,
		Opts:      metav1.ListOptions{LabelSelector: k.opts.LabelSelector, FieldSelector: k.opts.FieldSelector},
	})
}

// Key embeds an internal key structure and extends it with the support
// for the multi-cluster cache key creation.
type Key struct {
	key

	// token is an auth token used to exchange it for the context ID.
	token string

	// context is an internal identifier used in conjunction with the key
	// structure fields to create a cache key SHA that will be unique across
	// all clusters.
	context string
}

// MarshalJSON is a custom marshall implementation that allows to marshall internal Key fields.
// It is required during SHA calculation.
func (k Key) MarshalJSON() ([]byte, error) {
	return json.Marshal(struct {
		K       key
		Context string
	}{
		K:       k.key,
		Context: k.context,
	})
}

// SHA calculates Key SHA based on its internal fields.
// It is also responsible for exchanging the token for the context identifier with the external source of truth
// configured via `token-exchange-endpoint` flag.
func (k Key) SHA() (sha string, err error) {
	if !args.ClusterContextEnabled() {
		return k.key.SHA()
	}

	contextKey, exists := contextCache.Get(k.token)
	if !exists {
		contextKey, err = k.exchangeToken(k.token)
		if err != nil {
			return "", err
		}

		contextCache.SetWithTTL(k.token, contextKey, 1, args.CacheTTL())
	}

	k.context = contextKey
	return helpers.HashObject(k)
}

// exchangeToken exchanges the token for context identifier using the external source of truth
// configured via `token-exchange-endpoint` flag.
func (k Key) exchangeToken(token string) (string, error) {
	client := &http.Client{Transport: &tokenExchangeTransport{token, http.DefaultTransport}}
	response, err := client.Get(args.TokenExchangeEndpoint())
	if err != nil {
		return "", err
	}

	if response.StatusCode == http.StatusUnauthorized || response.StatusCode == http.StatusForbidden {
		return "", errors.NewUnauthorized(fmt.Sprintf("could not exchange token: %s", response.Status))
	}

	if response.StatusCode != http.StatusOK {
		klog.ErrorS(errors.NewBadRequest(response.Status), "could not exchange token", "url", args.TokenExchangeEndpoint())
		return "", errors.NewBadRequest(response.Status)
	}

	defer func(body io.ReadCloser) {
		if err := body.Close(); err != nil {
			klog.ErrorS(err, "could not close response body writer")
		}
	}(response.Body)

	contextKey, err := io.ReadAll(response.Body)
	if err != nil {
		return "", err
	}

	klog.V(3).InfoS("token exchange successful", "context", contextKey)
	return string(contextKey), nil
}

// NewKey creates a new cache Key.
func NewKey(kind types.ResourceKind, namespace, token string, opts metav1.ListOptions) Key {
	return Key{key: key{kind, namespace, opts}, token: token}
}

// tokenExchangeTransport implements the mechanism
// by which individual HTTP requests to token exchange endpoint are made.
type tokenExchangeTransport struct {
	token     string
	transport http.RoundTripper
}

// RoundTrip executes a single HTTP transaction.
func (in *tokenExchangeTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	req.Header.Set("Authorization", "Bearer "+in.token)
	return in.transport.RoundTrip(req)
}
