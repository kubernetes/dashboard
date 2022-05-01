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
	b64 "encoding/base64"
	"log"

	authApi "github.com/kubernetes/dashboard/src/app/backend/auth/api"
	clientapi "github.com/kubernetes/dashboard/src/app/backend/client/api"

	"github.com/kubernetes/dashboard/src/app/backend/errors"

	yaml "gopkg.in/yaml.v2"
	"k8s.io/client-go/tools/clientcmd/api"
)

// Below structures represent structure of kubeconfig file. They only contain fields required to gather data needed
// to log in user. It should support same auth options as defined in auth/api/types.go file. Currently: basic, token.

type contextInfo struct {
	User      string `yaml:"user"`
	Cluster   string `yaml:"cluster"`
	Namespace string `yaml:"namespace"`
}

type contextEntry struct {
	Name    string      `yaml:"name"`
	Context contextInfo `yaml:"context"`
}

type userEntry struct {
	Name string   `yaml:"name"`
	User userInfo `yaml:"user"`
}

type authProviderConfig struct {
	AccessToken string `yaml:"access-token"`
}

type authProviderInfo struct {
	Config authProviderConfig `yaml:"config"`
}

type userInfo struct {
	AuthProvider          authProviderInfo `yaml:"auth-provider,omitempty"`
	Token                 string           `yaml:"token,omitempty"`
	Username              string           `yaml:"username,omitempty"`
	Password              string           `yaml:"password,omitempty"`
	ClientCertificateData string           `yaml:"client-certificate-data,omitempty"`
	ClientKeyData         string           `yaml:"client-key-data,omitempty"`
}

type clusterInfo struct {
	CertificateAuthorityData string `yaml:"certificate-authority-data"`
	Server                   string `yaml:"server"`
}

type clusterEntry struct {
	Name    string      `yaml:"name"`
	Cluster clusterInfo `yaml:"cluster"`
}

type KubeConfig struct {
	Kind           string         `yaml:"kind,omitempty"`
	Contexts       []contextEntry `yaml:"contexts"`
	CurrentContext string         `yaml:"current-context"`
	Users          []userEntry    `yaml:"users"`
	Clusters       []clusterEntry `yaml:"clusters"`
}

// Implements Authenticator interface.
type kubeConfigAuthenticator struct {
	fileContent         []byte
	authModes           authApi.AuthenticationModes
	enableCertBasedAuth bool
}

// GetAuthInfo implements Authenticator interface. See Authenticator for more information.
func (self *kubeConfigAuthenticator) GetAuthInfo() (api.AuthInfo, error) {
	kubeConfig, err := ParseKubeConfig(self.fileContent)
	if err != nil {
		return api.AuthInfo{}, err
	}

	info, err := self.getCurrentUserInfo(*kubeConfig)
	if err != nil {
		return api.AuthInfo{}, err
	}

	if self.enableCertBasedAuth {
		clientCertDecoded, err := b64.StdEncoding.DecodeString(info.ClientCertificateData)
		if err != nil {
			return api.AuthInfo{}, err
		}

		userName := self.getCurrentUsername(*kubeConfig)

		return api.AuthInfo{
			ClientCertificateData: clientCertDecoded,
			Username:              userName,
		}, nil
	}

	return self.getAuthInfo(info)
}

// Returns user info based on defined current context. In case it is not found error is returned.
func (self *kubeConfigAuthenticator) getCurrentUserInfo(config KubeConfig) (userInfo, error) {
	userName := ""
	for _, context := range config.Contexts {
		if context.Name == config.CurrentContext {
			userName = context.Context.User
		}
	}

	if len(userName) == 0 {
		return userInfo{}, errors.NewInvalid("Context matching current context not found. Check if your config file is valid.")
	}

	for _, user := range config.Users {
		if user.Name == userName {
			return user.User, nil
		}
	}

	return userInfo{}, errors.NewInvalid("User matching current context user not found. Check if your config file is valid.")
}

// Returns auth info structure based on provided user info or error in case not enough data has been provided.
func (self *kubeConfigAuthenticator) getAuthInfo(info userInfo) (api.AuthInfo, error) {
	result := api.AuthInfo{}

	// If certificate-based authentication is enabled, return the userInfo username
	if self.enableCertBasedAuth {
		result.Username = info.Username
		return result, nil
	}

	// If "token" is empty for the current "user" entry, fallback to the value of "auth-provider.config.access-token".
	if len(info.Token) == 0 {
		info.Token = info.AuthProvider.Config.AccessToken
	}

	if len(info.Token) == 0 && (len(info.Password) == 0 || len(info.Username) == 0) {
		return api.AuthInfo{}, errors.NewInvalid("Not enough data to create auth info structure.")
	}

	if self.authModes.IsEnabled(authApi.Token) {
		result.Token = info.Token
	}

	if self.authModes.IsEnabled(authApi.Basic) {
		result.Username = info.Username
		result.Password = info.Password
	}

	return result, nil
}

// Retrieves the current Username from the kubeConfig
func (self *kubeConfigAuthenticator) getCurrentUsername(config KubeConfig) string {
	userName := ""
	for _, context := range config.Contexts {
		if context.Name == config.CurrentContext {
			userName = context.Context.User
		}
	}

	return userName
}

// NewBasicAuthenticator returns Authenticator based on LoginSpec.
func NewKubeConfigAuthenticator(spec *authApi.LoginSpec, authModes authApi.AuthenticationModes, enableCertBasedAuth bool) authApi.Authenticator {
	return &kubeConfigAuthenticator{
		fileContent:         []byte(spec.KubeConfig),
		authModes:           authModes,
		enableCertBasedAuth: enableCertBasedAuth,
	}
}

// Parses kubeconfig file and returns kubeConfig object.
func ParseKubeConfig(bytes []byte) (*KubeConfig, error) {
	kubeConfig := new(KubeConfig)
	if err := yaml.Unmarshal(bytes, kubeConfig); err != nil {
		return nil, err
	}

	return kubeConfig, nil
}

// Converts KubeConfig to bytes
func KubeConfigToBytes(kubeConfig KubeConfig) ([]byte, error) {
	bytes, err := yaml.Marshal(kubeConfig)
	if err != nil {
		return []byte(""), err
	}

	return bytes, nil
}

//Initializes the KubeConfig
func InitialKubeConfigBytes(clientManager clientapi.ClientManager, bytes []byte, apiServerHost string) error {
	kubeConfigBytes := bytes
	if len(apiServerHost) > 0 {
		log.Printf("Initializes kubeconfig apiserver host with: " + apiServerHost)

		kubeConfig, err := ParseKubeConfig(bytes)
		if err != nil {
			return err
		}

		for i := range kubeConfig.Clusters {
			kubeConfig.Clusters[i].Cluster.Server = apiServerHost
		}

		kubeConfigBytes, err = KubeConfigToBytes(*kubeConfig)
		if err != nil {
			return err
		}
	}

	clientManager.SetKubeConfigBytes(kubeConfigBytes)

	return nil
}
