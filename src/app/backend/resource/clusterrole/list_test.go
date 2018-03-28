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

package clusterrole

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
		clusterRoles []rbac.ClusterRole
		expected     *ClusterRoleList
	}{
		{nil, &ClusterRoleList{Items: []ClusterRole{}}},
		{
			[]rbac.ClusterRole{
				{
					ObjectMeta: metaV1.ObjectMeta{Name: "cluster-role"},
					Rules: []rbac.PolicyRule{{
						Verbs:     []string{"post", "put"},
						Resources: []string{"pods", "deployments"},
					}},
				},
			},
			&ClusterRoleList{
				ListMeta: api.ListMeta{TotalItems: 1},
				Items: []ClusterRole{{
					ObjectMeta: api.ObjectMeta{Name: "cluster-role", Namespace: ""},
					TypeMeta:   api.TypeMeta{Kind: api.ResourceKindClusterRole},
				}},
			},
		},
	}
	for _, c := range cases {
		actual := toClusterRoleLists(c.clusterRoles, nil, dataselect.NoDataSelect)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("toRbacRoleLists(%#v) == \n%#v\nexpected \n%#v\n",
				c.clusterRoles, actual, c.expected)
		}
	}
}
