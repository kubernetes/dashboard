// Copyright 2017 The Kubernetes Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package client

import (
	"net/http"
	"net/url"
	"reflect"
	"strings"
	"testing"

	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/kubernetes/scheme"
	restclient "k8s.io/client-go/rest"
	"k8s.io/client-go/rest/fake"

	"github.com/kubernetes/dashboard/src/app/backend/errors"
)

type clientFunc func(req *http.Request) (*http.Response, error)

func (f clientFunc) Do(req *http.Request) (*http.Response, error) {
	return f(req)
}

type FakeRESTClient struct {
	response *http.Response
	err      error
}

func NewFakeClientFunc(c *FakeRESTClient) clientFunc {
	return clientFunc(func(req *http.Request) (*http.Response, error) {
		return c.response, c.err
	})
}

func (c *FakeRESTClient) Delete() *restclient.Request {
	runtimeScheme := runtime.NewScheme()
	groupVersion := schema.GroupVersion{Group: "meta.k8s.io", Version: "v1"}
	runtimeScheme.AddKnownTypes(groupVersion, &metaV1.DeleteOptions{})
	contentConfig := restclient.ContentConfig{
		ContentType:          "application/json",
		GroupVersion:         &groupVersion,
		NegotiatedSerializer: scheme.Codecs.WithoutConversion(),
	}

	return restclient.NewRequestWithClient(&url.URL{Path: "/api/v1/"}, "",
		restclient.ClientContentConfig{
			Negotiator: runtime.NewClientNegotiator(contentConfig.NegotiatedSerializer, groupVersion),
		}, fake.CreateHTTPClient(NewFakeClientFunc(c))).Verb("DELETE")
}

func (c *FakeRESTClient) Put() *restclient.Request {
	return restclient.NewRequestWithClient(&url.URL{Path: "/api/v1/"}, "", restclient.ClientContentConfig{}, fake.CreateHTTPClient(NewFakeClientFunc(c))).Verb("PUT")
}

func (c *FakeRESTClient) Get() *restclient.Request {
	return restclient.NewRequestWithClient(&url.URL{Path: "/api/v1/"}, "", restclient.ClientContentConfig{}, fake.CreateHTTPClient(NewFakeClientFunc(c))).Verb("GET")
}

// Removes all quote signs that might have been added to the message.
// Might depend on dependencies version how they are constructed.
func normalize(msg string) string {
	return strings.Replace(msg, "\"", "", -1)
}

func TestDeleteShouldPropagateErrorsAndChooseClient(t *testing.T) {
	verber := resourceVerber{
		client:     &FakeRESTClient{err: errors.NewInvalid("err")},
		appsClient: &FakeRESTClient{err: errors.NewInvalid("err from apps")},
	}

	err := verber.Delete("replicaset", true, "bar", "baz")

	if !reflect.DeepEqual(normalize(err.Error()), "Delete /api/v1/namespaces/bar/replicasets/baz: err from apps") {
		t.Fatalf("Expected error on verber delete but got %#v", err.Error())
	}

	err = verber.Delete("service", true, "bar", "baz")

	if !reflect.DeepEqual(normalize(err.Error()), "Delete /api/v1/namespaces/bar/services/baz: err") {
		t.Fatalf("Expected error on verber delete but got %#v", err.Error())
	}

	err = verber.Delete("statefulset", true, "bar", "baz")

	if !reflect.DeepEqual(normalize(err.Error()), "Delete /api/v1/namespaces/bar/statefulsets/baz: err from apps") {
		t.Fatalf("Expected error on verber delete but got %#v", err.Error())
	}
}

func TestGetShouldPropagateErrorsAndChoseClient(t *testing.T) {
	verber := resourceVerber{
		client:     &FakeRESTClient{err: errors.NewInvalid("err")},
		appsClient: &FakeRESTClient{err: errors.NewInvalid("err from apps")},
	}

	_, err := verber.Get("replicaset", true, "bar", "baz")

	if !reflect.DeepEqual(normalize(err.Error()), "Get /api/v1/namespaces/bar/replicasets/baz: err from apps") {
		t.Fatalf("Expected error on verber delete but got %#v", err.Error())
	}

	_, err = verber.Get("service", true, "bar", "baz")

	if !reflect.DeepEqual(normalize(err.Error()), "Get /api/v1/namespaces/bar/services/baz: err") {
		t.Fatalf("Expected error on verber delete but got %#v", err.Error())
	}

	_, err = verber.Get("statefulset", true, "bar", "baz")

	if !reflect.DeepEqual(normalize(err.Error()), "Get /api/v1/namespaces/bar/statefulsets/baz: err from apps") {
		t.Fatalf("Expected error on verber delete but got %#v", err.Error())
	}
}

func TestDeleteShouldThrowErrorOnUnknownResourceKind(t *testing.T) {
	verber := resourceVerber{
		client:              &FakeRESTClient{},
		apiExtensionsClient: &FakeRESTClient{err: errors.NewNotFound("err")},
	}

	err := verber.Delete("foo", true, "bar", "baz")

	if !reflect.DeepEqual(normalize(err.Error()), "Get /api/v1/customresourcedefinitions/foo: err") {
		t.Fatalf("Expected error on verber delete but got %#v", err.Error())
	}
}

func TestGetShouldThrowErrorOnUnknownResourceKind(t *testing.T) {
	verber := resourceVerber{
		client:              &FakeRESTClient{},
		apiExtensionsClient: &FakeRESTClient{err: errors.NewNotFound("err")},
	}

	_, err := verber.Get("foo", true, "bar", "baz")

	if !reflect.DeepEqual(normalize(err.Error()), "Get /api/v1/customresourcedefinitions/foo: err") {
		t.Fatalf("Expected error on verber get but got %#v", err.Error())
	}
}

func TestPutShouldThrowErrorOnUnknownResourceKind(t *testing.T) {
	verber := resourceVerber{
		client:              &FakeRESTClient{},
		apiExtensionsClient: &FakeRESTClient{err: errors.NewNotFound("err")},
	}

	err := verber.Put("foo", false, "", "baz", nil)

	if !reflect.DeepEqual(normalize(err.Error()), "Get /api/v1/customresourcedefinitions/foo: err") {
		t.Fatalf("Expected error on verber put but got %#v", err.Error())
	}
}

func TestGetShouldRespectNamespacednessOfResourceKind(t *testing.T) {
	verber := resourceVerber{client: &FakeRESTClient{}}

	_, err := verber.Get("service", false, "", "baz")

	if !reflect.DeepEqual(err, errors.NewInvalid("Set no namespace for namespaced resource kind: service")) {
		t.Fatalf("Expected error on verber get but got %#v", err)
	}
}

func TestPutShouldRespectNamespacednessOfResourceKind(t *testing.T) {
	verber := resourceVerber{client: &FakeRESTClient{}}

	err := verber.Put("service", false, "", "baz", nil)

	if !reflect.DeepEqual(err, errors.NewInvalid("Set no namespace for namespaced resource kind: service")) {
		t.Fatalf("Expected error on verber put but got %#v", err)
	}
}

func TestDeleteShouldRespectNamespacednessOfResourceKind(t *testing.T) {
	verber := resourceVerber{client: &FakeRESTClient{}}

	err := verber.Delete("service", false, "", "baz")

	if !reflect.DeepEqual(err, errors.NewInvalid("Set no namespace for namespaced resource kind: service")) {
		t.Fatalf("Expected error on verber delete but got %#v", err)
	}
}

func TestGetShouldRespectNotNamespacednessOfResourceKind(t *testing.T) {
	verber := resourceVerber{client: &FakeRESTClient{}}

	_, err := verber.Get("namespace", true, "bar", "baz")

	if !reflect.DeepEqual(err, errors.NewInvalid("Set namespace for not-namespaced resource kind: namespace")) {
		t.Fatalf("Expected error on verber get but got %#v", err)
	}
}

func TestPutShouldRespectNotNamespacednessOfResourceKind(t *testing.T) {
	verber := resourceVerber{client: &FakeRESTClient{}}

	err := verber.Put("namespace", true, "bar", "baz", nil)

	if !reflect.DeepEqual(err, errors.NewInvalid("Set namespace for not-namespaced resource kind: namespace")) {
		t.Fatalf("Expected error on verber put but got %#v", err)
	}
}

func TestDeleteShouldRespectNotNamespacednessOfResourceKind(t *testing.T) {
	verber := resourceVerber{client: &FakeRESTClient{}}

	err := verber.Delete("namespace", true, "bar", "baz")

	if !reflect.DeepEqual(err, errors.NewInvalid("Set namespace for not-namespaced resource kind: namespace")) {
		t.Fatalf("Expected error on verber delete but got %#v", err)
	}
}
