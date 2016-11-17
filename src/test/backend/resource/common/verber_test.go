package common

import (
	"errors"
	"net/http"
	"reflect"
	"testing"

	"k8s.io/kubernetes/pkg/api/testapi"
	"k8s.io/kubernetes/pkg/client/restclient"
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
	codec := testapi.Default.Codec()
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
	verber := ResourceVerber{
		client:           &FakeRESTClient{err: errors.New("err")},
		extensionsClient: &FakeRESTClient{err: errors.New("err from extensions")},
		appsClient:       &FakeRESTClient{err: errors.New("err from apps")},
	}

	err := verber.Delete("replicaset", "bar", "baz")

	if !reflect.DeepEqual(err, errors.New("err from extensions")) {
		t.Fatalf("Expected error on verber delete but got %#v", err)
	}

	err = verber.Delete("service", "bar", "baz")

	if !reflect.DeepEqual(err, errors.New("err")) {
		t.Fatalf("Expected error on verber delete but got %#v", err)
	}

	err = verber.Delete("statefulset", "bar", "baz")

	if !reflect.DeepEqual(err, errors.New("err from apps")) {
		t.Fatalf("Expected error on verber delete but got %#v", err)
	}
}

func TestGetShouldPropagateErrorsAndChoseClient(t *testing.T) {
	verber := ResourceVerber{
		client:           &FakeRESTClient{err: errors.New("err")},
		extensionsClient: &FakeRESTClient{err: errors.New("err from extensions")},
		appsClient:       &FakeRESTClient{err: errors.New("err from apps")},
	}

	_, err := verber.Get("replicaset", "bar", "baz")

	if !reflect.DeepEqual(err, errors.New("err from extensions")) {
		t.Fatalf("Expected error on verber delete but got %#v", err)
	}

	_, err = verber.Get("service", "bar", "baz")

	if !reflect.DeepEqual(err, errors.New("err")) {
		t.Fatalf("Expected error on verber delete but got %#v", err)
	}

	_, err = verber.Get("statefulset", "bar", "baz")

	if !reflect.DeepEqual(err, errors.New("err from apps")) {
		t.Fatalf("Expected error on verber delete but got %#v", err)
	}
}

func TestDeleteShouldThrowErrorOnUnknownResourceKind(t *testing.T) {
	verber := ResourceVerber{client: &FakeRESTClient{}}

	err := verber.Delete("foo", "bar", "baz")

	if !reflect.DeepEqual(err, errors.New("Unknown resource kind: foo")) {
		t.Fatalf("Expected error on verber delete but got %#v", err)
	}
}

func TestGetShouldThrowErrorOnUnknownResourceKind(t *testing.T) {
	verber := ResourceVerber{client: &FakeRESTClient{}}

	_, err := verber.Get("foo", "bar", "baz")

	if !reflect.DeepEqual(err, errors.New("Unknown resource kind: foo")) {
		t.Fatalf("Expected error on verber get but got %#v", err)
	}
}

func TestPutShouldThrowErrorOnUnknownResourceKind(t *testing.T) {
	verber := ResourceVerber{client: &FakeRESTClient{}}

	err := verber.Put("foo", "bar", "baz", nil)

	if !reflect.DeepEqual(err, errors.New("Unknown resource kind: foo")) {
		t.Fatalf("Expected error on verber put but got %#v", err)
	}
}
