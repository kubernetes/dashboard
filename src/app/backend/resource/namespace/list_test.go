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

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	v1 "k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func TestGetNamespaceList(t *testing.T) {
	cases := []struct {
		namespaces []v1.Namespace
		expected   *NamespaceList
	}{
		{
			nil,
			&NamespaceList{
				Namespaces: []Namespace{},
			},
		},
		{
			[]v1.Namespace{
				{
					ObjectMeta: metaV1.ObjectMeta{
						Name: "foo",
					},
				},
			},
			&NamespaceList{
				ListMeta: api.ListMeta{
					TotalItems: 1,
				},
				Namespaces: []Namespace{{
					TypeMeta:   api.TypeMeta{Kind: "namespace"},
					ObjectMeta: api.ObjectMeta{Name: "foo"},
				}},
			},
		},
	}
	for _, c := range cases {
		actual := toNamespaceList(c.namespaces, nil, dataselect.NoDataSelect)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getNamespaceList(%#v) == \n%#v\nexpected \n%#v\n",
				c.namespaces, actual, c.expected)
		}
	}
}
