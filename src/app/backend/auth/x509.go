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
	authApi "github.com/kubernetes/dashboard/src/app/backend/auth/api"
	"k8s.io/client-go/tools/clientcmd/api"
)

// x509Authenticator implements Authenticator interface
type x509Authenticator struct {
	clientCert []byte
	clientKey  []byte
}

func (self x509Authenticator) GetAuthInfo() (api.AuthInfo, error) {
	return api.AuthInfo{
		ClientCertificateData: self.clientCert,
		ClientKeyData:         self.clientKey,
	}, nil
}

func NewX509Authenticator(spec *authApi.LoginSpec) authApi.Authenticator {
	return &x509Authenticator{
		clientCert: spec.ClientCert,
		clientKey:  spec.ClientKey,
	}
}
