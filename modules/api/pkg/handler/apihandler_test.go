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
	"bytes"
	"encoding/json"
	"net/http"
	"strings"
	"testing"

	"github.com/emicklei/go-restful/v3"
	"github.com/spf13/pflag"
	"k8s.io/klog/v2"

	"k8s.io/dashboard/api/pkg/args"
)

func TestCreateHTTPAPIHandler(t *testing.T) {
	_, err := CreateHTTPAPIHandler(nil)
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

func TestFormatRequestLog(t *testing.T) {
	cases := []struct {
		method      string
		uri         string
		content     map[string]string
		expected    string
		apiLogLevel klog.Level
	}{
		{
			"PUT",
			"/api/v1/pod",
			map[string]string{},
			"Incoming HTTP/1.1 PUT /api/v1/pod request",
			args.LogLevelDefault,
		},
		{
			"PUT",
			"/api/v1/pod",
			map[string]string{},
			"",
			args.LogLevelMinimal,
		},
		{
			"POST",
			"/api/v1/login",
			map[string]string{"password": "abc123"},
			"Incoming HTTP/1.1 POST /api/v1/login request from { content hidden }: { content hidden }",
			args.LogLevelDefault,
		},
		{
			"POST",
			"/api/v1/login",
			map[string]string{},
			"",
			args.LogLevelMinimal,
		},
		{
			"POST",
			"/api/v1/login",
			map[string]string{"password": "abc123"},
			"Incoming HTTP/1.1 POST /api/v1/login request from : {\"password\":\"abc123\"}",
			args.LogLevelDebug,
		},
	}

	for _, c := range cases {
		jsonValue, _ := json.Marshal(c.content)

		req, err := http.NewRequest(c.method, c.uri, bytes.NewReader(jsonValue))
		req.Header.Set("Content-Type", "application/json")

		if err != nil {
			t.Error("Cannot mockup request")
		}

		_ = pflag.Set("v", c.apiLogLevel.String())

		var restfulRequest restful.Request
		restfulRequest.Request = req

		actual := formatRequestLog(&restfulRequest)
		if !strings.Contains(actual, c.expected) {
			t.Errorf("formatRequestLog(%#v) returns %#v, expected to contain %#v", req, actual, c.expected)
		}
	}
}
