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
	yaml "gopkg.in/yaml.v2"
	"k8s.io/client-go/tools/clientcmd/api"
)

type contextInfo struct {
	User string `yaml:"user"`
}

type contextEntry struct {
	Name    string      `yaml:"name"`
	Context contextInfo `yaml:"context"`
}

type userEntry struct {
	Name string   `yaml:"name"`
	User userInfo `yaml:"user"`
}

type userInfo struct {
	Token    string `yaml:"token"`
	Username string `yaml:"username"`
	Password string `yaml:"password"`
}

type kubeConfig struct {
	Contexts       []contextEntry `yaml:"contexts"`
	CurrentContext string         `yaml:"current-context"`
	Users          []userEntry    `yaml:"users"`
}

// Implements Authenticator interface
type kubeConfigAuthenticator struct {
	fileContent []byte
}

// GetAuthInfo implements Authenticator interface. See Authenticator for more information.
func (self *kubeConfigAuthenticator) GetAuthInfo() (api.AuthInfo, error) {
	kubeConfig, err := self.parseKubeConfig(self.fileContent)
	if err != nil {
		return api.AuthInfo{}, err
	}

	info, err := self.getCurrentUserInfo(*kubeConfig)
	if err != nil {
		return api.AuthInfo{}, err
	}

	return self.getAuthInfo(info)
}

func (self *kubeConfigAuthenticator) parseKubeConfig(bytes []byte) (*kubeConfig, error) {
	kubeConfig := new(kubeConfig)
	if err := yaml.Unmarshal(bytes, kubeConfig); err != nil {
		return nil, err
	}

	return kubeConfig, nil
}

func (self *kubeConfigAuthenticator) getCurrentUserInfo(config kubeConfig) (userInfo, error) {
	userName := ""
	for _, context := range config.Contexts {
		if context.Name == config.CurrentContext {
			userName = context.Context.User
		}
	}

	if len(userName) == 0 {
		return userInfo{}, errors.New("Context matching current context not found. Check if your config file is valid.")
	}

	for _, user := range config.Users {
		if user.Name == userName {
			return user.User, nil
		}
	}

	return userInfo{}, errors.New("User matching current context user not found. Check if your config file is valid.")
}

func (self *kubeConfigAuthenticator) getAuthInfo(info userInfo) (api.AuthInfo, error) {
	if len(info.Token) == 0 && (len(info.Password) == 0 || len(info.Username) == 0) {
		return api.AuthInfo{}, errors.New("Not enough data to create auth info structure.")
	}

	return api.AuthInfo{
		Username: info.Username,
		Password: info.Password,
		Token:    info.Token,
	}, nil
}

// NewBasicAuthenticator returns Authenticator based on LoginSpec.
func NewKubeConfigAuthenticator(spec *authApi.LoginSpec) authApi.Authenticator {
	return &kubeConfigAuthenticator{
		fileContent: []byte(spec.KubeConfig),
	}
}
