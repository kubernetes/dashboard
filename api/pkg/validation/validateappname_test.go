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

package validation

import (
	"testing"

	api "k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/client-go/kubernetes/fake"
)

func TestValidateName(t *testing.T) {
	spec := &AppNameValiditySpec{
		Namespace: "foo-namespace",
		Name:      "foo-name",
	}
	cases := []struct {
		spec     *AppNameValiditySpec
		objects  []runtime.Object
		expected bool
	}{
		{
			spec,
			nil,
			true,
		},
		{
			spec,
			[]runtime.Object{&api.ReplicationController{
				ObjectMeta: metaV1.ObjectMeta{
					Name: "rc-1", Namespace: "ns-1",
				},
			}},
			true,
		},
		{
			spec,
			[]runtime.Object{&api.Service{
				ObjectMeta: metaV1.ObjectMeta{
					Name: "rc-1", Namespace: "ns-1",
				},
			}},
			true,
		},
		{
			spec,
			[]runtime.Object{&api.ReplicationController{
				ObjectMeta: metaV1.ObjectMeta{
					Name: "rc-1", Namespace: "ns-1",
				},
			}, &api.Service{
				ObjectMeta: metaV1.ObjectMeta{
					Name: "rc-1", Namespace: "ns-1",
				},
			}},
			true,
		},
	}

	for _, c := range cases {
		testClient := fake.NewSimpleClientset(c.objects...)
		validity, _ := ValidateAppName(c.spec, testClient)
		if validity.Valid != c.expected {
			t.Errorf("Expected %#v validity to be %#v for objects %#v, but was %#v\n",
				c.spec, c.expected, c.objects, validity)
		}
	}
}
