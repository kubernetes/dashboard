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

package handler

import (
	"net/http"
	"testing"

	"bytes"
	"reflect"
	"strings"

	restful "github.com/emicklei/go-restful"
	"github.com/kubernetes/dashboard/src/app/backend/auth"
	authApi "github.com/kubernetes/dashboard/src/app/backend/auth/api"
	"github.com/kubernetes/dashboard/src/app/backend/auth/jwe"
	"github.com/kubernetes/dashboard/src/app/backend/client"
	"github.com/kubernetes/dashboard/src/app/backend/settings"
	"github.com/kubernetes/dashboard/src/app/backend/sync"
	"github.com/kubernetes/dashboard/src/app/backend/systembanner"
	"k8s.io/client-go/kubernetes/fake"
)

func getTokenManager() authApi.TokenManager {
	c := fake.NewSimpleClientset()
	syncManager := sync.NewSynchronizerManager(c)
	holder := jwe.NewRSAKeyHolder(syncManager.Secret("", ""))
	return jwe.NewJWETokenManager(holder)
}

func TestCreateHTTPAPIHandler(t *testing.T) {
	cManager := client.NewClientManager("", "http://localhost:8080")
	authManager := auth.NewAuthManager(cManager, getTokenManager(), authApi.AuthenticationModes{}, true)
	sManager := settings.NewSettingsManager(cManager)
	sbManager := systembanner.NewSystemBannerManager("Hello world!", "INFO")
	_, err := CreateHTTPAPIHandler(nil, cManager, authManager, sManager, sbManager)
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

func TestMapUrlToResource(t *testing.T) {
	cases := []struct {
		url, expected string
	}{
		{
			"/api/v1/pod",
			"pod",
		},
		{
			"/api/v1/node",
			"node",
		},
	}
	for _, c := range cases {
		actual := mapUrlToResource(c.url)
		if !reflect.DeepEqual(actual, &c.expected) {
			t.Errorf("mapUrlToResource(%#v) returns %#v, expected %#v", c.url, actual, c.expected)
		}
	}
}

func TestFormatRequestLog(t *testing.T) {
	cases := []struct {
		method   string
		uri      string
		content  *bytes.Reader
		expected string
	}{
		{
			"PUT",
			"/api/v1/pod",
			bytes.NewReader([]byte("{}")),
			"Incoming HTTP/1.1 PUT /api/v1/pod request",
		},
		{
			"POST",
			"/api/v1/login",
			bytes.NewReader([]byte("{}")),
			"Incoming HTTP/1.1 POST /api/v1/login request from : { contents hidden }",
		},
	}

	for _, c := range cases {
		req, err := http.NewRequest(c.method, c.uri, c.content)
		if err != nil {
			t.Error("Cannot mockup request")
		}

		var restfulRequest restful.Request
		restfulRequest.Request = req

		actual := formatRequestLog(&restfulRequest)
		if !strings.Contains(actual, c.expected) {
			t.Errorf("formatRequestLog(%#v) returns %#v, expected to contain %#v", req, actual, c.expected)
		}
	}
}
