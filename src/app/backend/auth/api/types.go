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

// Resource information that are used as encryption key storage. Can be accessible by multiple dashboard replicas.
const (
	EncryptionKeyHolderName      = "kubernetes-dashboard-key-holder"
	EncryptionKeyHolderNamespace = "kube-system"
)

// AuthManager is used for user authentication management.
type AuthManager interface {
	// Login authenticates user based on provided LoginSpec and returns LoginResponse. LoginResponse contains
	// generated token and list of non-critical errors such as 'Failed authentication'.
	Login(*LoginSpec) (*LoginResponse, error)
}

// TokenManager is responsible for generating and decrypting tokens used for authorization. Authorization is handled
// by K8S apiserver. Token contains AuthInfo structure used to create K8S api client.
type TokenManager interface {
	// Generate secure token based on AuthInfo structure and save it it tokens' payload.
	Generate(api.AuthInfo) (string, error)
	// Decrypt generated token and return AuthInfo structure that will be used for K8S api client creation.
	Decrypt(string) (*api.AuthInfo, error)
}

// Authenticator represents authentication methods supported by Dashboard. Currently supported types are:
//    - Token based (any bearer token accepted by apiserver)
// TODO(floreks): add basic and kubeconfig-based auth
type Authenticator interface {
	// GetAuthInfo returns filled AuthInfo structure that can be used for K8S api client creation.
	GetAuthInfo() (api.AuthInfo, error)
}

// LoginSpec is extracted from request coming from Dashboard frontend during login request. It contains all the
// information required to authenticate user.
type LoginSpec struct {
	// Username is the username for basic authentication to the kubernetes cluster.
	Username string `json:"username"`
	// Password is the password for basic authentication to the kubernetes cluster.
	Password string `json:"password"`
	// Token is the bearer token for authentication to the kubernetes cluster.
	Token string `json:"token"`
	// KubeConfig is the content of users' kubeconfig file. It will be parsed and auth data will be extracted.
	// Kubeconfig can not contain any paths. All data has to be provided within the file.
	KubeConfig string `json:"kubeConfig"`
}

// LoginResponse is returned from our backend as a response for login request. It contains generated JWEToken and a list
// of non-critical errors such as 'Failed authentication'.
type LoginResponse struct {
	// JWEToken is a token generated during login request that contains AuthInfo data in the payload.
	JWEToken string `json:"jweToken"`
	// Errors are a list of non-critical errors that happened during login request.
	Errors []error `json:"errors"`
}
