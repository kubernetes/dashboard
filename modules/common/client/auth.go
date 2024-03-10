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
)

const (
	// authorizationHeader is the default authorization header name.
	authorizationHeader = "Authorization"
	// authorizationTokenPrefix is the default bearer token prefix.
	authorizationTokenPrefix = "Bearer "
	// xAuthorizationHeader to support kubectl proxy stripping Authorization header
	xAuthorizationHeader = "X-Dashboard-Authorization"
)

func HasAuthorizationHeader(req *http.Request) bool {
	header := getAuthorizationHeader(req)
	if len(header) == 0 {
		return false
	}

	token := extractBearerToken(header)
	return strings.HasPrefix(header, authorizationTokenPrefix) && len(token) > 0
}

func GetBearerToken(req *http.Request) string {
	header := getAuthorizationHeader(req)
	return extractBearerToken(header)
}

func SetAuthorizationHeader(req *http.Request, token string) {
	req.Header.Set(xAuthorizationHeader, authorizationTokenPrefix+token)
	req.Header.Set(authorizationHeader, authorizationTokenPrefix+token)
}

func extractBearerToken(header string) string {
	return strings.TrimPrefix(header, authorizationTokenPrefix)
}

func getAuthorizationHeader(req *http.Request) string {
	authHeader := req.Header.Get(authorizationHeader)
	if len(authHeader) == 0 {
		xAuthorization := req.Header.Get(xAuthorizationHeader)
		if len(xAuthorization) != 0 {
			authHeader = xAuthorization
			req.Header.Set("Authorization", xAuthorization)
			req.Header.Del(xAuthorizationHeader)
		}
	}
	return authHeader
}
