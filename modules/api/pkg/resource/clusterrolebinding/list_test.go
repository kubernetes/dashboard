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

package clusterrolebinding

import (
	"reflect"
	"testing"

	rbac "k8s.io/api/rbac/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	"k8s.io/dashboard/api/pkg/resource/dataselect"
	"k8s.io/dashboard/types"
)

func TestToRbacClusterRoleBindingLists(t *testing.T) {
	cases := []struct {
		ClusterRoleBindings []rbac.ClusterRoleBinding
		expected            *ClusterRoleBindingList
	}{
		{nil, &ClusterRoleBindingList{Items: []ClusterRoleBinding{}}},
		{
			[]rbac.ClusterRoleBinding{
				{
					ObjectMeta: metaV1.ObjectMeta{Name: "clusterRoleBinding"},
					Subjects: []rbac.Subject{{
						Kind:     "User",
						Name:     "dashboard",
						APIGroup: "rbac.authorization.k8s.io",
					}},
					RoleRef: rbac.RoleRef{
						APIGroup: "Role",
						Kind:     "pod-reader",
						Name:     "rbac.authorization.k8s.io",
					},
				},
			},
			&ClusterRoleBindingList{
				ListMeta: types.ListMeta{TotalItems: 1},
				Items: []ClusterRoleBinding{{
					ObjectMeta: types.ObjectMeta{Name: "clusterRoleBinding", Namespace: ""},
					TypeMeta:   types.TypeMeta{Kind: types.ResourceKindClusterRoleBinding},
				}},
			},
		},
	}
	for _, c := range cases {
		actual := toClusterRoleBindingList(c.ClusterRoleBindings, nil, dataselect.NoDataSelect)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("toRbacRoleLists(%#v) == \n%#v\nexpected \n%#v\n",
				c.ClusterRoleBindings, actual, c.expected)
		}
	}
}
