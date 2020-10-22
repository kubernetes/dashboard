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

package validation

import (
	"crypto/tls"
	"net/http"
	"net/textproto"
	"reflect"
	"testing"

	restful "github.com/emicklei/go-restful/v3"
	"github.com/kubernetes/dashboard/src/app/backend/client"
)

func TestValidateLoginStatus(t *testing.T) {
	cases := []struct {
		info     string
		request  *restful.Request
		expected *LoginStatus
	}{
		{
			"Should indicate that user is logged in with token",
			&restful.Request{Request: &http.Request{Header: http.Header(map[string][]string{
				textproto.CanonicalMIMEHeaderKey(client.JWETokenHeader): {"test-token"},
			})}},
			&LoginStatus{TokenPresent: true},
		},
		{
			"Should indicate that user is logged in using authorization header",
			&restful.Request{Request: &http.Request{Header: http.Header(map[string][]string{
				"Authorization": {"Bearer test-token"},
			})}},
			&LoginStatus{HeaderPresent: true},
		},
		{
			"Should indicate that https is enabled",
			&restful.Request{Request: &http.Request{TLS: &tls.ConnectionState{}}},
			&LoginStatus{HTTPSMode: true},
		},
		{
			"Should indicate that user is not logged in",
			&restful.Request{Request: &http.Request{}},
			&LoginStatus{},
		},
	}

	for _, c := range cases {
		status := ValidateLoginStatus(c.request)

		if !reflect.DeepEqual(status, c.expected) {
			t.Errorf("Test Case: %s. Expected status to be: %v, but got %v.",
				c.info, c.expected, status)
		}
	}
}
