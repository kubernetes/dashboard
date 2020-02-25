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

package csrf

import (
	"context"
	"log"

	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"

	"github.com/kubernetes/dashboard/src/app/backend/args"
	"github.com/kubernetes/dashboard/src/app/backend/client/api"
)

// Implements CsrfTokenManager interface.
type csrfTokenManager struct {
	token  string
	client kubernetes.Interface
}

func (self *csrfTokenManager) init() {
	log.Printf("Initializing csrf token from %s secret", api.CsrfTokenSecretName)
	tokenSecret, err := self.client.CoreV1().
		Secrets(args.Holder.GetNamespace()).
		Get(context.TODO(), api.CsrfTokenSecretName, v1.GetOptions{})

	if err != nil {
		panic(err)
	}

	token := string(tokenSecret.Data[api.CsrfTokenSecretData])
	if len(token) == 0 {
		log.Printf("Empty token. Generating and storing in a secret %s", api.CsrfTokenSecretName)
		token = api.GenerateCSRFKey()
		tokenSecret.StringData = map[string]string{api.CsrfTokenSecretData: token}
		_, err := self.client.CoreV1().Secrets(args.Holder.GetNamespace()).Update(context.TODO(), tokenSecret, v1.UpdateOptions{})
		if err != nil {
			panic(err)
		}
	}

	self.token = token
}

// Token implements CsrfTokenManager interface.
func (self *csrfTokenManager) Token() string {
	return self.token
}

// NewCsrfTokenManager creates and initializes new instace of csrf token manager.
func NewCsrfTokenManager(client kubernetes.Interface) api.CsrfTokenManager {
	manager := &csrfTokenManager{client: client}
	manager.init()

	return manager
}
