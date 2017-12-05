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
	"errors"
	"net/http"
	"reflect"
	"testing"

	testapi "k8s.io/apimachinery/pkg/api/testing"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
	runtimeserializer "k8s.io/apimachinery/pkg/runtime/serializer"
	restclient "k8s.io/client-go/rest"
)

type clientFunc func(req *http.Request) (*http.Response, error)

func (f clientFunc) Do(req *http.Request) (*http.Response, error) {
	return f(req)
}

type FakeRESTClient struct {
	response *http.Response
	err      error
}

func (c *FakeRESTClient) Delete() *restclient.Request {
	scheme := runtime.NewScheme()

	groupVersion := schema.GroupVersion{Group: "meta.k8s.io", Version: "v1"}

	scheme.AddKnownTypes(groupVersion, &metaV1.DeleteOptions{})

	factory := runtimeserializer.NewCodecFactory(scheme)
	codec := testapi.TestCodec(factory, metaV1.SchemeGroupVersion)
	return restclient.NewRequest(clientFunc(func(req *http.Request) (*http.Response, error) {
		return c.response, c.err
	}), "DELETE", nil, "/api/v1", restclient.ContentConfig{}, restclient.Serializers{
		Encoder: codec,
	}, nil, nil)
}

func (c *FakeRESTClient) Put() *restclient.Request {
	return restclient.NewRequest(clientFunc(func(req *http.Request) (*http.Response, error) {
		return c.response, c.err
	}), "PUT", nil, "/api/v1", restclient.ContentConfig{}, restclient.Serializers{}, nil, nil)
}

func (c *FakeRESTClient) Get() *restclient.Request {
	return restclient.NewRequest(clientFunc(func(req *http.Request) (*http.Response, error) {
		return c.response, c.err
	}), "GET", nil, "/api/v1", restclient.ContentConfig{}, restclient.Serializers{}, nil, nil)
}

func TestDeleteShouldPropagateErrorsAndChoseClient(t *testing.T) {
	verber := resourceVerber{
		client:           &FakeRESTClient{err: errors.New("err")},
		extensionsClient: &FakeRESTClient{err: errors.New("err from extensions")},
		appsClient:       &FakeRESTClient{err: errors.New("err from apps")},
	}

	err := verber.Delete("replicaset", true, "bar", "baz")

	if !reflect.DeepEqual(err, errors.New("err from extensions")) {
		t.Fatalf("Expected error on verber delete but got %#v", err.Error())
	}

	err = verber.Delete("service", true, "bar", "baz")

	if !reflect.DeepEqual(err, errors.New("err")) {
		t.Fatalf("Expected error on verber delete but got %#v", err)
	}

	err = verber.Delete("statefulset", true, "bar", "baz")

	if !reflect.DeepEqual(err, errors.New("err from apps")) {
		t.Fatalf("Expected error on verber delete but got %#v", err)
	}
}

func TestGetShouldPropagateErrorsAndChoseClient(t *testing.T) {
	verber := resourceVerber{
		client:           &FakeRESTClient{err: errors.New("err")},
		extensionsClient: &FakeRESTClient{err: errors.New("err from extensions")},
		appsClient:       &FakeRESTClient{err: errors.New("err from apps")},
	}

	_, err := verber.Get("replicaset", true, "bar", "baz")

	if !reflect.DeepEqual(err, errors.New("err from extensions")) {
		t.Fatalf("Expected error on verber delete but got %#v", err)
	}

	_, err = verber.Get("service", true, "bar", "baz")

	if !reflect.DeepEqual(err, errors.New("err")) {
		t.Fatalf("Expected error on verber delete but got %#v", err)
	}

	_, err = verber.Get("statefulset", true, "bar", "baz")

	if !reflect.DeepEqual(err, errors.New("err from apps")) {
		t.Fatalf("Expected error on verber delete but got %#v", err)
	}
}

func TestDeleteShouldThrowErrorOnUnknownResourceKind(t *testing.T) {
	verber := resourceVerber{client: &FakeRESTClient{}}

	err := verber.Delete("foo", true, "bar", "baz")

	if !reflect.DeepEqual(err, errors.New("Unknown resource kind: foo")) {
		t.Fatalf("Expected error on verber delete but got %#v", err)
	}
}

func TestGetShouldThrowErrorOnUnknownResourceKind(t *testing.T) {
	verber := resourceVerber{client: &FakeRESTClient{}}

	_, err := verber.Get("foo", true, "bar", "baz")

	if !reflect.DeepEqual(err, errors.New("Unknown resource kind: foo")) {
		t.Fatalf("Expected error on verber get but got %#v", err)
	}
}

func TestPutShouldThrowErrorOnUnknownResourceKind(t *testing.T) {
	verber := resourceVerber{client: &FakeRESTClient{}}

	err := verber.Put("foo", false, "", "baz", nil)

	if !reflect.DeepEqual(err, errors.New("Unknown resource kind: foo")) {
		t.Fatalf("Expected error on verber put but got %#v", err)
	}
}

func TestGetShouldRespectNamespacednessOfResourceKind(t *testing.T) {
	verber := resourceVerber{client: &FakeRESTClient{}}

	_, err := verber.Get("service", false, "", "baz")

	if !reflect.DeepEqual(err, errors.New("Set no namespace for namespaced resource kind: service")) {
		t.Fatalf("Expected error on verber get but got %#v", err)
	}
}

func TestPutShouldRespectNamespacednessOfResourceKind(t *testing.T) {
	verber := resourceVerber{client: &FakeRESTClient{}}

	err := verber.Put("service", false, "", "baz", nil)

	if !reflect.DeepEqual(err, errors.New("Set no namespace for namespaced resource kind: service")) {
		t.Fatalf("Expected error on verber put but got %#v", err)
	}
}

func TestDeleteShouldRespectNamespacednessOfResourceKind(t *testing.T) {
	verber := resourceVerber{client: &FakeRESTClient{}}

	err := verber.Delete("service", false, "", "baz")

	if !reflect.DeepEqual(err, errors.New("Set no namespace for namespaced resource kind: service")) {
		t.Fatalf("Expected error on verber delete but got %#v", err)
	}
}

func TestGetShouldRespectNotNamespacednessOfResourceKind(t *testing.T) {
	verber := resourceVerber{client: &FakeRESTClient{}}

	_, err := verber.Get("namespace", true, "bar", "baz")

	if !reflect.DeepEqual(err, errors.New("Set namespace for not-namespaced resource kind: namespace")) {
		t.Fatalf("Expected error on verber get but got %#v", err)
	}
}

func TestPutShouldRespectNotNamespacednessOfResourceKind(t *testing.T) {
	verber := resourceVerber{client: &FakeRESTClient{}}

	err := verber.Put("namespace", true, "bar", "baz", nil)

	if !reflect.DeepEqual(err, errors.New("Set namespace for not-namespaced resource kind: namespace")) {
		t.Fatalf("Expected error on verber put but got %#v", err)
	}
}

func TestDeleteShouldRespectNotNamespacednessOfResourceKind(t *testing.T) {
	verber := resourceVerber{client: &FakeRESTClient{}}

	err := verber.Delete("namespace", true, "bar", "baz")

	if !reflect.DeepEqual(err, errors.New("Set namespace for not-namespaced resource kind: namespace")) {
		t.Fatalf("Expected error on verber delete but got %#v", err)
	}
}
