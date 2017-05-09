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

package rbacroles

import (
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	api "k8s.io/apimachinery/pkg/apis/meta/v1"
	rbac "k8s.io/client-go/pkg/apis/rbac/v1alpha1"
)

func TestGetRbacRoleList(t *testing.T) {
	cases := []struct {
		roles        []rbac.Role
		clusterRoles []rbac.ClusterRole
		expected     *RbacRoleList
	}{
		{nil, nil, &RbacRoleList{Items: []RbacRole{}}},
		{
			[]rbac.Role{
				{
					ObjectMeta: api.ObjectMeta{Name: "Role", Namespace: "Testing"},
					Rules: []rbac.PolicyRule{{
						Verbs:     []string{"get", "put"},
						Resources: []string{"pods"},
					}},
				},
			},
			[]rbac.ClusterRole{
				{
					ObjectMeta: api.ObjectMeta{Name: "cluster-role"},
					Rules: []rbac.PolicyRule{{
						Verbs:     []string{"post", "put"},
						Resources: []string{"pods", "deployments"},
					}},
				},
			},
			&RbacRoleList{
				ListMeta: common.ListMeta{TotalItems: 2},
				Items: []RbacRole{{
					ObjectMeta: common.ObjectMeta{Name: "Role", Namespace: "Testing"},
					TypeMeta:   common.TypeMeta{Kind: common.ResourceKindRbacRole},
				}, {
					ObjectMeta: common.ObjectMeta{Name: "cluster-role", Namespace: ""},
					TypeMeta:   common.TypeMeta{Kind: common.ResourceKindRbacClusterRole},
				}},
			},
		},
	}
	for _, c := range cases {
		actual := SimplifyRbacRoleLists(c.roles, c.clusterRoles, dataselect.NoDataSelect)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getRbacRoleList(%#v,%#v) == \n%#v\nexpected \n%#v\n",
				c.roles, c.clusterRoles, actual, c.expected)
		}
	}
}
