// Copyright 2015 Google Inc. All Rights Reserved.
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

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	api "k8s.io/apimachinery/pkg/apis/meta/v1"
	rbac "k8s.io/client-go/pkg/apis/rbac/v1alpha1"
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
					ObjectMeta: api.ObjectMeta{Name: "RoleBinding", Namespace: "Testing"},
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
					ObjectMeta: api.ObjectMeta{Name: "ClusterRoleBinding", Namespace: ""},
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
				ListMeta: common.ListMeta{TotalItems: 2},
				Items: []RbacRoleBinding{{
					ObjectMeta: common.ObjectMeta{Name: "RoleBinding", Namespace: "Testing"},
					TypeMeta:   common.NewTypeMeta(common.ResourceKindRbacRoleBinding),
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
					ObjectMeta: common.ObjectMeta{Name: "ClusterRoleBinding", Namespace: ""},
					TypeMeta:   common.NewTypeMeta(common.ResourceKindRbacClusterRoleBinding),
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
