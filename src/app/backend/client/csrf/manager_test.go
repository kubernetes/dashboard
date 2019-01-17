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

package csrf_test

import (
	"testing"

	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes/fake"

	"github.com/kubernetes/dashboard/src/app/backend/client/api"
	"github.com/kubernetes/dashboard/src/app/backend/client/csrf"
)

func TestCsrfTokenManager_Token(t *testing.T) {
	cases := []struct {
		info       string
		csrfSecret *v1.Secret
		wantPanic  bool
		wantToken  bool
	}{
		{"should panic when secret does not exist", nil, true, false},
		{"should generate token when secret exists",
			&v1.Secret{
				ObjectMeta: metav1.ObjectMeta{
					Name: api.CsrfTokenSecretName,
				},
			}, false, true},
	}

	for _, c := range cases {
		t.Run(c.info, func(t *testing.T) {
			defer func() {
				r := recover()
				if (r != nil) != c.wantPanic {
					t.Errorf("Recover = %v, wantPanic = %v", r, c.wantPanic)
				}
			}()

			client := fake.NewSimpleClientset(c.csrfSecret)
			manager := csrf.NewCsrfTokenManager(client)

			if (len(manager.Token()) == 0) == c.wantToken {
				t.Errorf("Expected token to exist: %v", c.wantToken)
			}
		})

	}
}
