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

package namespace

import (
	"reflect"
	"testing"

	v1 "k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	"k8s.io/dashboard/types"
)

func TestGetNamespaceDetail(t *testing.T) {
	cases := []struct {
		namespace v1.Namespace
		expected  *NamespaceDetail
	}{
		{
			v1.Namespace{
				ObjectMeta: metaV1.ObjectMeta{Name: "foo"},
				Status: v1.NamespaceStatus{
					Phase: v1.NamespaceActive,
				},
			},
			&NamespaceDetail{
				Namespace: Namespace{
					TypeMeta:   types.TypeMeta{Kind: "namespace"},
					ObjectMeta: types.ObjectMeta{Name: "foo"},
					Phase:      v1.NamespaceActive,
				},
			},
		},
	}
	for _, c := range cases {
		actual := toNamespaceDetail(c.namespace, nil, nil, nil)
		if !reflect.DeepEqual(&actual, c.expected) {
			t.Errorf("toNamespaceDetail(%#v) == \n%#v\nexpected \n%#v\n",
				c.namespace, actual, c.expected)
		}
	}
}
