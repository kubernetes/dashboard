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

package jwt

import (
	"crypto/rand"
	"crypto/rsa"

	authApi "github.com/kubernetes/dashboard/src/app/backend/auth/api"
	"gopkg.in/square/go-jose.v2"
	"k8s.io/apimachinery/pkg/util/json"
	"k8s.io/client-go/tools/clientcmd/api"
)

// TODO(floreks): Should be retrieved from a secret
var tokenSigningKey *rsa.PrivateKey

// On dashboard start generates the token signing key
func init() {
	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		panic(err)
	}

	tokenSigningKey = privateKey
}

// Implements TokenManager interface
type jwtTokenManager struct{}

func (self jwtTokenManager) Generate(authInfo api.AuthInfo) (token string, err error) {
	publicKey := &tokenSigningKey.PublicKey
	encrypter, err := jose.NewEncrypter(jose.A256GCM, jose.Recipient{Algorithm: jose.RSA_OAEP_256, Key: publicKey}, nil)
	if err != nil {
		return "", err
	}

	marshalledAuthInfo, err := json.Marshal(authInfo)
	if err != nil {
		return "", err
	}

	// TODO(floreks): add token expiration header and handle it
	jwtObject, err := encrypter.Encrypt(marshalledAuthInfo)
	if err != nil {
		return "", err
	}

	return jwtObject.FullSerialize(), nil
}

func (self jwtTokenManager) validate(token string) (*jose.JSONWebEncryption, error) {
	// TODO(floreks): validate token expiration
	return jose.ParseEncrypted(token)
}

func (self jwtTokenManager) Decrypt(token string) (*api.AuthInfo, error) {
	jweToken, err := self.validate(token)
	if err != nil {
		return nil, err
	}

	decrypted, err := jweToken.Decrypt(tokenSigningKey)
	if err != nil {
		return nil, err
	}

	authInfo := new(api.AuthInfo)
	err = json.Unmarshal(decrypted, authInfo)
	return authInfo, err
}

func NewJWTTokenManager() authApi.TokenManager {
	return &jwtTokenManager{}
}
