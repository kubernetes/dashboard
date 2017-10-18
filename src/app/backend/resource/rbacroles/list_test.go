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

package rbacroles

import (
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	rbac "k8s.io/api/rbac/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func TestToRbacRoleLists(t *testing.T) {
	cases := []struct {
		roles        []rbac.Role
		clusterRoles []rbac.ClusterRole
		expected     *RbacRoleList
	}{
		{nil, nil, &RbacRoleList{Items: []RbacRole{}}},
		{
			[]rbac.Role{
				{
					ObjectMeta: metaV1.ObjectMeta{Name: "Role", Namespace: "Testing"},
					Rules: []rbac.PolicyRule{{
						Verbs:     []string{"get", "put"},
						Resources: []string{"pods"},
					}},
				},
			},
			[]rbac.ClusterRole{
				{
					ObjectMeta: metaV1.ObjectMeta{Name: "cluster-role"},
					Rules: []rbac.PolicyRule{{
						Verbs:     []string{"post", "put"},
						Resources: []string{"pods", "deployments"},
					}},
				},
			},
			&RbacRoleList{
				ListMeta: api.ListMeta{TotalItems: 2},
				Items: []RbacRole{{
					ObjectMeta: api.ObjectMeta{Name: "Role", Namespace: "Testing"},
					TypeMeta:   api.TypeMeta{Kind: api.ResourceKindRbacRole},
				}, {
					ObjectMeta: api.ObjectMeta{Name: "cluster-role", Namespace: ""},
					TypeMeta:   api.TypeMeta{Kind: api.ResourceKindRbacClusterRole},
				}},
			},
		},
	}
	for _, c := range cases {
		actual := toRbacRoleLists(c.roles, c.clusterRoles, nil, dataselect.NoDataSelect)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("toRbacRoleLists(%#v,%#v) == \n%#v\nexpected \n%#v\n",
				c.roles, c.clusterRoles, actual, c.expected)
		}
	}
}
