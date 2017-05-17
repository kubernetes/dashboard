package handler

import (
	"net/http"
	"testing"

	"github.com/emicklei/go-restful"
)

func TestCreateHTTPAPIHandler(t *testing.T) {
	_, err := CreateHTTPAPIHandler(nil, ApiClientConfig{ApiserverHost: "127.0.0.1", KubeConfigFile: ""})
	if err != nil {
		t.Fatal("CreateHTTPAPIHandler() cannot create HTTP API handler")
	}
}

func TestShouldDoCsrfValidation(t *testing.T) {
	cases := []struct {
		request  *restful.Request
		expected bool
	}{
		{
			&restful.Request{
				Request: &http.Request{
					Method: "PUT",
				},
			},
			false,
		},
		{
			&restful.Request{
				Request: &http.Request{
					Method: "POST",
				},
			},
			true,
		},
	}
	for _, c := range cases {
		actual := shouldDoCsrfValidation(c.request)
		if actual != c.expected {
			t.Errorf("shouldDoCsrfValidation(%#v) returns %#v, expected %#v", c.request, actual, c.expected)
		}
	}
}

// TODO(maciaszczykm): https://github.com/emicklei/go-restful/blob/master/examples/restful-curly-router_test.go
