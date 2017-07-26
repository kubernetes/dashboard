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
	"k8s.io/client-go/tools/clientcmd/api"
)

// authManager implements AuthManager interface
type authManager struct {
	tokenManager  authApi.TokenManager
	clientManager client.ClientManager
}

func (self authManager) Login(spec *authApi.LoginSpec) (string, error) {
	authenticator, err := self.getAuthenticator(spec)
	if err != nil {
		return "", err
	}

	authInfo, err := authenticator.GetAuthInfo()
	if err != nil {
		return "", err
	}

	if err := self.healthCheck(authInfo); err != nil {
		return "", err
	}

	token, err := self.tokenManager.Generate(authInfo)
	if err != nil {
		return "", err
	}

	return token, nil
}

func (self authManager) DecryptToken(token string) (*api.AuthInfo, error) {
	return self.tokenManager.Decrypt(token)
}

func (self authManager) getAuthenticator(spec *authApi.LoginSpec) (authApi.Authenticator, error) {
	switch {
	case len(spec.Username) > 0 && len(spec.Password) > 0:
		return NewBasicAuthenticator(spec), nil
	case len(spec.Token) > 0:
		return NewTokenAuthenticator(spec), nil
	case len(spec.ClientKey) > 0 && len(spec.ClientCert) > 0:
		return NewX509Authenticator(spec), nil
	case len(spec.KubeConfig) > 0:
		return nil, errors.New("Not implemented.")
	}

	return nil, errors.New("Not enough data to create authenticator.")
}

func (self authManager) healthCheck(authInfo api.AuthInfo) error {
	// TODO(floreks): do a health check against apiserver to see if given auth info is valid
	if !self.clientManager.HasAccess(authInfo) {
		return errors.New("Unauthorized")
	}

	return nil
}

func NewAuthManager(clientManager client.ClientManager) authApi.AuthManager {
	return &authManager{
		tokenManager:  jwt.NewJWTTokenManager(),
		clientManager: clientManager,
	}
}
