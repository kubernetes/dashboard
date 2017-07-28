// Copyright 2017 The Kubernetes Dashboard Authors.
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
	"github.com/kubernetes/dashboard/src/app/backend/auth/jwt"
	"github.com/kubernetes/dashboard/src/app/backend/client"
	kdErrors "github.com/kubernetes/dashboard/src/app/backend/errors"
	"k8s.io/client-go/tools/clientcmd/api"
)

// authManager implements AuthManager interface
type authManager struct {
	tokenManager  authApi.TokenManager
	clientManager client.ClientManager
}

func (self authManager) Login(spec *authApi.LoginSpec) (authApi.LoginResponse, error) {
	authenticator, err := self.getAuthenticator(spec)
	if err != nil {
		return authApi.LoginResponse{}, err
	}

	authInfo, err := authenticator.GetAuthInfo()
	if err != nil {
		return authApi.LoginResponse{}, err
	}

	err = self.healthCheck(authInfo)
	nonCriticalErrors, criticalError := kdErrors.HandleError(err)
	if criticalError != nil || len(nonCriticalErrors) > 0 {
		return authApi.LoginResponse{Errors: nonCriticalErrors}, criticalError
	}

	token, err := self.tokenManager.Generate(authInfo)
	if err != nil {
		return authApi.LoginResponse{}, err
	}

	return authApi.LoginResponse{JWEToken: token, Errors: nonCriticalErrors}, nil
}

func (self authManager) getAuthenticator(spec *authApi.LoginSpec) (authApi.Authenticator, error) {
	switch {
	case len(spec.Username) > 0 && len(spec.Password) > 0:
		return nil, errors.New("Not implemented.")
	case len(spec.Token) > 0:
		return NewTokenAuthenticator(spec), nil
	case len(spec.ClientKey) > 0 && len(spec.ClientCert) > 0:
		return nil, errors.New("Not implemented.")
	case len(spec.KubeConfig) > 0:
		return nil, errors.New("Not implemented.")
	}

	return nil, errors.New("Not enough data to create authenticator.")
}

func (self authManager) healthCheck(authInfo api.AuthInfo) error {
	return self.clientManager.HasAccess(authInfo)
}

func NewAuthManager(clientManager client.ClientManager) authApi.AuthManager {
	return &authManager{
		tokenManager:  jwt.NewJWTTokenManager(),
		clientManager: clientManager,
	}
}
