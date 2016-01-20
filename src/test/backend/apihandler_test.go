// Copyright 2015 Google Inc. All Rights Reserved.
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

package main

import (
	"fmt"
	"net/http"
	"reflect"
	"testing"

	restful "github.com/emicklei/go-restful"
)

func TestGetRemoteAddr(t *testing.T) {
	cases := []struct {
		request  *restful.Request
		expected string
	}{
		{
			&restful.Request{
				Request: &http.Request{
					RemoteAddr: "192.168.1.1:8080",
				},
			},
			"192.168.1.1",
		},
		{
			&restful.Request{
				Request: &http.Request{
					RemoteAddr: "192.168.1.2",
				},
			},
			"192.168.1.2",
		},
	}
	for _, c := range cases {
		actual := GetRemoteAddr(c.request)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetRemoteAddr(%#v) == %#v, expected %#v", c.request, actual, c.expected)
		}
	}
}

func TestFormatRequestLog(t *testing.T) {
	cases := []struct {
		request    *restful.Request
		remoteAddr string
		expected   string
	}{
		{
			&restful.Request{
				Request: &http.Request{
					RemoteAddr: "192.168.1.1:8080",
					Proto:      "HTTP 1.1",
					Method:     "GET",
				},
			},
			"192.168.1.1",
			fmt.Sprintf(RequestLogString, "HTTP 1.1", "GET", "", "192.168.1.1"),
		},
	}
	for _, c := range cases {
		actual := FormatRequestLog(c.request, c.remoteAddr)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetRemoteAddr(%#v, %#v) == %#v, expected %#v", c.request, c.remoteAddr,
				actual, c.expected)
		}
	}
}

func TestFormatResponseLog(t *testing.T) {
	cases := []struct {
		response   *restful.Response
		remoteAddr string
		expected   string
	}{
		{
			&restful.Response{},
			"192.168.1.1",
			fmt.Sprintf(ResponseLogString, "192.168.1.1", http.StatusOK),
		},
	}
	for _, c := range cases {
		actual := FormatResponseLog(c.response, c.remoteAddr)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetRemoteAddr(%#v, %#v) == %#v, expected %#v", c.response, c.remoteAddr,
				actual, c.expected)
		}
	}
}
