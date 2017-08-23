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
	"reflect"
	"testing"

	restful "github.com/emicklei/go-restful"
	authApi "github.com/kubernetes/dashboard/src/app/backend/auth/api"
	"github.com/kubernetes/dashboard/src/app/backend/client"
	k8sErrors "k8s.io/apimachinery/pkg/api/errors"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/tools/clientcmd/api"
)

func areErrorsEqual(err1, err2 error) bool {
	return (err1 != nil && err2 != nil && err1.Error() == err2.Error()) ||
		(err1 == nil && err2 == nil)
}

type fakeClientManager struct {
	HasAccessError error
}

func (self *fakeClientManager) Client(req *restful.Request) (kubernetes.Interface, error) {
	return nil, nil
}

func (self *fakeClientManager) InsecureClient() kubernetes.Interface {
	return nil
}

func (self *fakeClientManager) SetTokenManager(manager authApi.TokenManager) {}

func (self *fakeClientManager) Config(req *restful.Request) (*rest.Config, error) {
	return nil, nil
}

func (self *fakeClientManager) ClientCmdConfig(req *restful.Request) (clientcmd.ClientConfig, error) {
	return clientcmd.NewDefaultClientConfig(api.Config{}, &clientcmd.ConfigOverrides{}), nil
}

func (self *fakeClientManager) CSRFKey() string {
	return ""
}

func (self *fakeClientManager) HasAccess(authInfo api.AuthInfo) error {
	return self.HasAccessError
}

func (self *fakeClientManager) VerberClient(req *restful.Request) (client.ResourceVerber, error) {
	return client.ResourceVerber{}, nil
}

type fakeTokenManager struct {
	GeneratedToken string
	Error          error
}

func (self *fakeTokenManager) Generate(authInfo api.AuthInfo) (string, error) {
	return self.GeneratedToken, self.Error
}

func (self *fakeTokenManager) Decrypt(jweToken string) (*api.AuthInfo, error) {
	return nil, nil
}

func TestAuthManager_Login(t *testing.T) {
	unauthorizedErr := k8sErrors.NewUnauthorized("Unauthorized")

	cases := []struct {
		info        string
		spec        *authApi.LoginSpec
		cManager    client.ClientManager
		tManager    authApi.TokenManager
		expected    *authApi.LoginResponse
		expectedErr error
	}{
		{
			"Empty login spec should throw authenticator error",
			&authApi.LoginSpec{},
			&fakeClientManager{HasAccessError: nil},
			&fakeTokenManager{},
			nil,
			errors.New("Not enough data to create authenticator."),
		}, {
			"Not recognized token should throw unauthorized error",
			&authApi.LoginSpec{Token: "not-existing-token"},
			&fakeClientManager{HasAccessError: unauthorizedErr},
			&fakeTokenManager{},
			&authApi.LoginResponse{Errors: []error{unauthorizedErr}},
			nil,
		}, {
			"Recognized token should allow login and return JWE token",
			&authApi.LoginSpec{Token: "existing-token"},
			&fakeClientManager{HasAccessError: nil},
			&fakeTokenManager{GeneratedToken: "generated-token"},
			&authApi.LoginResponse{JWEToken: "generated-token", Errors: make([]error, 0)},
			nil,
		}, {
			"Should propagate error on unexpected error",
			&authApi.LoginSpec{Token: "test-token"},
			&fakeClientManager{HasAccessError: errors.New("Unexpected error")},
			&fakeTokenManager{},
			&authApi.LoginResponse{Errors: make([]error, 0)},
			errors.New("Unexpected error"),
		},
	}

	for _, c := range cases {
		authManager := NewAuthManager(c.cManager, c.tManager)
		response, err := authManager.Login(c.spec)

		if !areErrorsEqual(err, c.expectedErr) {
			t.Errorf("Test Case: %s. Expected error to be: %v, but got %v.",
				c.info, c.expectedErr, err)
		}

		if !reflect.DeepEqual(response, c.expected) {
			t.Errorf("Test Case: %s. Expected response to be: %v, but got %v.",
				c.info, c.expected, response)
		}
	}
}
