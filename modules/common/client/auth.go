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

package client

import (
	"net/http"
	"strings"

	"k8s.io/klog/v2"
)

const (
	// authorizationHeader is the default authorization header name.
	authorizationHeader = "Authorization"
	// authorizationTokenPrefix is the default bearer token prefix.
	authorizationTokenPrefix = "Bearer "
)

func HasAuthorizationHeader(req *http.Request) bool {
	header := req.Header.Get(authorizationHeader)
	if len(header) == 0 {
		return false
	}

	token := extractBearerToken(header)
	klog.V(5).InfoS("Bearer token", "size", len(token))
	return strings.HasPrefix(header, authorizationTokenPrefix) && len(token) > 0
}

func GetBearerToken(req *http.Request) string {
	header := req.Header.Get(authorizationHeader)
	return extractBearerToken(header)
}

func SetAuthorizationHeader(req *http.Request, token string) {
	req.Header.Set(authorizationHeader, authorizationTokenPrefix+token)
}

func extractBearerToken(header string) string {
	return strings.TrimPrefix(header, authorizationTokenPrefix)
}
