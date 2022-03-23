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

package priorityclass

import (
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	scheduling "k8s.io/api/scheduling/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func TestToPriorityClassLists(t *testing.T) {
	cases := []struct {
		priorityClasses []scheduling.PriorityClass
		expected        *PriorityClassList
	}{
		{nil, &PriorityClassList{Items: []PriorityClass{}}},
		{
			[]scheduling.PriorityClass{
				{
					ObjectMeta: metaV1.ObjectMeta{Name: "a-priorityclass"},
				},
				{
					ObjectMeta: metaV1.ObjectMeta{Name: "another-priorityclass"},
				},
			},
			&PriorityClassList{
				ListMeta: api.ListMeta{TotalItems: 2},
				Items: []PriorityClass{
					{
						ObjectMeta: api.ObjectMeta{Name: "a-priorityclass", Namespace: ""},
						TypeMeta:   api.TypeMeta{Kind: api.ResourceKindPriorityClass},
					},
					{
						ObjectMeta: api.ObjectMeta{Name: "another-priorityclass", Namespace: ""},
						TypeMeta:   api.TypeMeta{Kind: api.ResourceKindPriorityClass},
					},
				},
			},
		},
	}
	for _, p := range cases {
		actual := toPriorityClassLists(p.priorityClasses, nil, dataselect.NoDataSelect)
		if !reflect.DeepEqual(actual, p.expected) {
			t.Errorf("toPriorityClassLists(%#v) == \n%#v\nexpected \n%#v\n",
				p.priorityClasses, actual, p.expected)
		}
	}
}
