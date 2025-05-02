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

package secret

import (
	"reflect"
	"testing"

	v1 "k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	"k8s.io/dashboard/types"
)

func TestGetSecretDetail(t *testing.T) {
	cases := []struct {
		secrets  *v1.Secret
		expected *SecretDetail
	}{
		{
			&v1.Secret{
				Data: map[string][]byte{"app": {0, 1, 2, 3}},
				ObjectMeta: metaV1.ObjectMeta{
					Name: "foo",
				},
			},
			&SecretDetail{
				Secret: Secret{
					TypeMeta: types.TypeMeta{
						Kind: "secret",
					},
					ObjectMeta: types.ObjectMeta{
						Name: "foo",
					},
				},
				Data: map[string][]byte{"app": {0, 1, 2, 3}},
			},
		},
	}
	for _, c := range cases {
		actual := getSecretDetail(c.secrets)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getSecretDetail(%#v) == \n%#v\nexpected \n%#v\n", c.secrets, actual, c.expected)
		}
	}
}
