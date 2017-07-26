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

package api

import "k8s.io/client-go/tools/clientcmd/api"

type AuthManager interface {
	Login(*LoginSpec) (string, error)
	DecryptToken(string) (*api.AuthInfo, error)
}

type TokenManager interface {
	Generate(api.AuthInfo) (string, error)
	Decrypt(string) (*api.AuthInfo, error)
}

type Authenticator interface {
	GetAuthInfo() (api.AuthInfo, error)
}

type LoginSpec struct {
	// Username is the username for basic authentication to the kubernetes cluster.
	Username string `json:"username"`
	// Password is the password for basic authentication to the kubernetes cluster.
	Password string `json:"password"`

	// ClientCert contains PEM-encoded data from a client cert file for TLS. Overrides ClientCertificate
	ClientCert []byte `json:"clientCert"`
	// ClientKey contains PEM-encoded data from a client key file for TLS. Overrides ClientKey
	ClientKey []byte `json:"clientKey"`

	// Token is the bearer token for authentication to the kubernetes cluster.
	Token string `json:"token"`

	// KubeConfig is the content of users' kubeconfig file. It will be parsed and auth data will be extracted.
	// Kubeconfig can not contain any paths. All data has to be provided within the file.
	KubeConfig string `json:"kubeConfig"`
}

type LoginResponse struct {
	JWTToken string `json:"jwtToken"`
}
