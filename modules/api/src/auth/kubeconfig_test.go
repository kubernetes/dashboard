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
	"bytes"
	"reflect"
	"testing"
	"text/template"

	"k8s.io/client-go/tools/clientcmd/api"

	authApi "github.com/kubernetes/dashboard/src/app/backend/auth/api"
	"github.com/kubernetes/dashboard/src/app/backend/errors"
)

const kubeconfigTemplate = `
apiVersion: v1
kind: Config
clusters:
- cluster:
    insecure-skip-tls-verify: true
    server: https://localhost:6443
  name: foo
contexts:
- context:
    cluster: foo
    user: foo
  name: foo
current-context: foo
users:
- name: foo
  user:
{{if .username}}
    username: {{.username}}
{{end}}
{{if .password}}
    password: {{.password}}
{{end}}
{{if .token}}
    token: {{.token}}
{{end}}
{{if .accessToken}}
    auth-provider:
      config:
        access-token: {{.accessToken}}
{{end}}
`

func TestKubeConfigAuthenticator(t *testing.T) {
	authModeBasic := map[authApi.AuthenticationMode]bool{
		authApi.Basic: true,
	}
	authModeBoth := map[authApi.AuthenticationMode]bool{
		authApi.Basic: true,
		authApi.Token: true,
	}
	authModeToken := map[authApi.AuthenticationMode]bool{
		authApi.Token: true,
	}

	cases := []struct {
		info        string
		authModes   authApi.AuthenticationModes
		params      map[string]string
		expected    api.AuthInfo
		expectedErr error
	}{
		{
			`If "token" is empty for the current "user" entry, the value of "auth-provider.config.access-token" is picked up.`,
			authModeToken,
			map[string]string{"accessToken": "foo", "token": ""},
			api.AuthInfo{Token: "foo"},
			nil,
		},
		{
			`If "token" is provided for the current "user" entry, that token is picked up instead.`,
			authModeToken,
			map[string]string{"accessToken": "foo", "token": "bar"},
			api.AuthInfo{Token: "bar"},
			nil,
		},
		{
			`If the "basic" auth mode is enabled, "username" and "password" are picked up.`,
			authModeBasic,
			map[string]string{"username": "foo", "password": "bar"},
			api.AuthInfo{Username: "foo", Password: "bar"},
			nil,
		},
		{
			`If no value for "token", "username" or "password" is provided or can be inferred, an error is returned.`,
			authModeBoth,
			map[string]string{},
			api.AuthInfo{},
			errors.NewInvalid("Not enough data to create auth info structure."),
		},
	}
	for _, c := range cases {
		kubeconfig := template.Must(template.New("kubeconfig").Parse(kubeconfigTemplate))
		kb := new(bytes.Buffer)
		if err := kubeconfig.Execute(kb, c.params); err != nil {
			t.Errorf("Test Case: %s. Failed to render kubeconfig: %v.", c.info, err)
		}

		kubeConfigAuthenticator := NewKubeConfigAuthenticator(&authApi.LoginSpec{KubeConfig: kb.String()}, c.authModes)
		response, err := kubeConfigAuthenticator.GetAuthInfo()

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
