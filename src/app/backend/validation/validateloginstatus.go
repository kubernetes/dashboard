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
	restful "github.com/emicklei/go-restful/v3"
	"github.com/kubernetes/dashboard/src/app/backend/args"
	"github.com/kubernetes/dashboard/src/app/backend/client"
)

// LoginStatus is returned as a response to login status check. Used by the frontend to determine if is logged in
// and if login page should be shown.
type LoginStatus struct {
	// True when token header indicating logged in user is found in request.
	TokenPresent bool `json:"tokenPresent"`
	// True when authorization header indicating logged in user is found in request.
	HeaderPresent bool `json:"headerPresent"`
	// True if dashboard is configured to use HTTPS connection. It is required for secure
	// data exchange during login operation.
	HTTPSMode bool `json:"httpsMode"`
	// True if impersonation is enabled
	ImpersonationPresent bool `json:"impersonationPresent"`

	// The impersonated user
	ImpersonatedUser string `json:"impersonatedUser"`
}

// ValidateLoginStatus returns information about user login status and if request was made over HTTPS.
func ValidateLoginStatus(request *restful.Request) *LoginStatus {
	authHeader := request.HeaderParameter("Authorization")
	tokenHeader := request.HeaderParameter(client.JWETokenHeader)
	impersonationHeader := request.HeaderParameter("Impersonate-User")

	httpsMode := request.Request.TLS != nil
	if args.Holder.GetEnableInsecureLogin() {
		httpsMode = true
	}

	loginStatus := &LoginStatus{
		TokenPresent:         len(tokenHeader) > 0,
		HeaderPresent:        len(authHeader) > 0,
		ImpersonationPresent: len(impersonationHeader) > 0,
		HTTPSMode:            httpsMode,
	}

	if loginStatus.ImpersonationPresent {
		loginStatus.ImpersonatedUser = impersonationHeader
	}

	return loginStatus
}
