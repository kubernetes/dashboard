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

package handler

import (
	"fmt"
	"net/http"
	"reflect"
	"testing"

	restful "github.com/emicklei/go-restful"
)

func TestFormatResponseLog(t *testing.T) {
	cases := []struct {
		response *restful.Response
		request  *restful.Request
		expected string
	}{
		{
			&restful.Response{},
			&restful.Request{
				Request: &http.Request{
					RemoteAddr: "192.168.1.1",
				},
			},
			fmt.Sprintf(ResponseLogString, "192.168.1.1", http.StatusOK),
		},
	}
	for _, c := range cases {
		actual := FormatResponseLog(c.response, c.request)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("FormatResponseLog(%#v, %#v) == %#v, expected %#v", c.response, c.request,
				actual, c.expected)
		}
	}
}
