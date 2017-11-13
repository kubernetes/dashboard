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

package rbacrolebindings

import (
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	rbac "k8s.io/api/rbac/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func TestGetRbacRoleBindingList(t *testing.T) {
	cases := []struct {
		roleBindings        []rbac.RoleBinding
		clusterRoleBindings []rbac.ClusterRoleBinding
		expected            *RbacRoleBindingList
	}{
		{nil, nil, &RbacRoleBindingList{Items: []RbacRoleBinding{}}},
		{
			[]rbac.RoleBinding{
				{
					ObjectMeta: metaV1.ObjectMeta{Name: "RoleBinding", Namespace: "Testing"},
					Subjects: []rbac.Subject{{
						Kind:      "ServiceAccount",
						Name:      "Testuser",
						Namespace: "default",
					}, {
						Kind: "User",
						Name: "johndoe",
					}},
					RoleRef: rbac.RoleRef{
						Kind:     "Role",
						APIGroup: "rbac.authorization.k8s.io",
						Name:     "my-role",
					},
				},
			},
			[]rbac.ClusterRoleBinding{
				{
					ObjectMeta: metaV1.ObjectMeta{Name: "ClusterRoleBinding", Namespace: ""},
					Subjects: []rbac.Subject{{
						Kind: "Group",
						Name: "admins",
					}, {
						Kind: "User",
						Name: "johndoe",
					}},
					RoleRef: rbac.RoleRef{
						Kind:     "Role",
						APIGroup: "rbac.authorization.k8s.io",
						Name:     "my-role",
					},
				},
			},
			&RbacRoleBindingList{
				ListMeta: api.ListMeta{TotalItems: 2},
				Items: []RbacRoleBinding{{
					ObjectMeta: api.ObjectMeta{Name: "RoleBinding", Namespace: "Testing"},
					TypeMeta:   api.NewTypeMeta(api.ResourceKindRbacRoleBinding),
					Name:       "RoleBinding",
					Namespace:  "Testing",
					Subjects: []rbac.Subject{{
						Kind:      "ServiceAccount",
						Name:      "Testuser",
						Namespace: "default",
					}, {
						Kind: "User",
						Name: "johndoe",
					}},
					RoleRef: rbac.RoleRef{
						Kind:     "Role",
						APIGroup: "rbac.authorization.k8s.io",
						Name:     "my-role",
					},
				}, {
					ObjectMeta: api.ObjectMeta{Name: "ClusterRoleBinding", Namespace: ""},
					TypeMeta:   api.NewTypeMeta(api.ResourceKindRbacClusterRoleBinding),
					Name:       "ClusterRoleBinding",
					Namespace:  "",
					Subjects: []rbac.Subject{{
						Kind: "Group",
						Name: "admins",
					}, {
						Kind: "User",
						Name: "johndoe",
					}},
					RoleRef: rbac.RoleRef{
						Kind:     "Role",
						APIGroup: "rbac.authorization.k8s.io",
						Name:     "my-role",
					},
				}},
			},
		},
	}
	for _, c := range cases {
		actual := SimplifyRbacRoleBindingLists(c.roleBindings, c.clusterRoleBindings, dataselect.NoDataSelect)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getRbacRoleBindingList(%#v,%#v) == \n%#v\nexpected \n%#v\n",
				c.roleBindings, c.clusterRoleBindings, actual, c.expected)
		}
	}
}
