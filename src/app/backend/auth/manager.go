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

package auth

import (
	"errors"

	authApi "github.com/kubernetes/dashboard/src/app/backend/auth/api"
	clientapi "github.com/kubernetes/dashboard/src/app/backend/client/api"
	kdErrors "github.com/kubernetes/dashboard/src/app/backend/errors"
	"k8s.io/client-go/tools/clientcmd/api"
)

// Implements AuthManager interface
type authManager struct {
	tokenManager        authApi.TokenManager
	clientManager       clientapi.ClientManager
	authenticationModes authApi.AuthenticationModes
}

// Login implements auth manager. See AuthManager interface for more information.
func (self authManager) Login(spec *authApi.LoginSpec) (*authApi.AuthResponse, error) {
	authenticator, err := self.getAuthenticator(spec)
	if err != nil {
		return nil, err
	}

	authInfo, err := authenticator.GetAuthInfo()
	if err != nil {
		return nil, err
	}

	err = self.healthCheck(authInfo)
	nonCriticalErrors, criticalError := kdErrors.HandleError(err)
	if criticalError != nil || len(nonCriticalErrors) > 0 {
		return &authApi.AuthResponse{Errors: nonCriticalErrors}, criticalError
	}

	token, err := self.tokenManager.Generate(authInfo)
	if err != nil {
		return nil, err
	}

	return &authApi.AuthResponse{JWEToken: token, Errors: nonCriticalErrors}, nil
}

// Refresh implements auth manager. See AuthManager interface for more information.
func (self authManager) Refresh(jweToken string) (string, error) {
	return self.tokenManager.Refresh(jweToken)
}

func (self authManager) AuthenticationModes() []authApi.AuthenticationMode {
	return self.authenticationModes.Array()
}

// Returns authenticator based on provided LoginSpec.
func (self authManager) getAuthenticator(spec *authApi.LoginSpec) (authApi.Authenticator, error) {
	if len(self.authenticationModes) == 0 {
		return nil, errors.New("All authentication options disabled. Check --authentication-modes argument for more information.")
	}

	switch {
	case len(spec.Token) > 0 && self.authenticationModes.IsEnabled(authApi.Token):
		return NewTokenAuthenticator(spec), nil
	case len(spec.Username) > 0 && len(spec.Password) > 0 && self.authenticationModes.IsEnabled(authApi.Basic):
		return NewBasicAuthenticator(spec), nil
	case len(spec.KubeConfig) > 0:
		return NewKubeConfigAuthenticator(spec, self.authenticationModes), nil
	}

	return nil, errors.New("Not enough data to create authenticator.")
}

// Checks if user data extracted from provided AuthInfo structure is valid and user is correctly authenticated
// by K8S apiserver.
func (self authManager) healthCheck(authInfo api.AuthInfo) error {
	return self.clientManager.HasAccess(authInfo)
}

// NewAuthManager creates auth manager.
func NewAuthManager(clientManager clientapi.ClientManager, tokenManager authApi.TokenManager,
	authenticationModes authApi.AuthenticationModes) authApi.AuthManager {
	return &authManager{
		tokenManager:        tokenManager,
		clientManager:       clientManager,
		authenticationModes: authenticationModes,
	}
}
