// Copyright 2017 Google Inc. All Rights Reserved.
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
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	client "k8s.io/client-go/kubernetes"
	rbac "k8s.io/client-go/pkg/apis/rbac/v1alpha1"
)

// RbacRoleList contains a list of Roles and ClusterRoles in the cluster.
type RbacRoleList struct {
	ListMeta common.ListMeta `json:"listMeta"`

	// Unordered list of RbacRoles
	Items []RbacRole `json:"items"`
}

// RbacRole provides the simplified, combined presentation layer view of Kubernetes' RBAC Roles and ClusterRoles.
// ClusterRoles will be referred to as Roles for the namespace "all namespaces".
type RbacRole struct {
	ObjectMeta common.ObjectMeta `json:"objectMeta"`
	TypeMeta   common.TypeMeta   `json:"typeMeta"`
	Rules      []rbac.PolicyRule `json:"rules"`
	Name       string            `json:"name"`
	Namespace  string            `json:"namespace"`
}

// GetRbacRoleList returns a list of all RBAC Roles in the cluster.
func GetRbacRoleList(client *client.Clientset, dsQuery *dataselect.DataSelectQuery) (*RbacRoleList, error) {
	log.Print("Getting list rbac roles")
	channels := &common.ResourceChannels{
		RoleList:        common.GetRoleListChannel(client, 1),
		ClusterRoleList: common.GetClusterRoleListChannel(client, 1),
	}

	return GetRbacRoleListFromChannels(channels, dsQuery)
}

// GetRbacRoleListFromChannels returns a list of all RBAC roles in the cluster
// reading required resource list once from the channels.
func GetRbacRoleListFromChannels(channels *common.ResourceChannels, dsQuery *dataselect.DataSelectQuery) (
	*RbacRoleList, error) {

	roles := <-channels.RoleList.List
	if err := <-channels.RoleList.Error; err != nil {
		return nil, err
	}
	clusterRoles := <-channels.ClusterRoleList.List
	if err := <-channels.ClusterRoleList.Error; err != nil {
		return nil, err
	}

	result := SimplifyRbacRoleLists(roles.Items, clusterRoles.Items, dsQuery)

	return result, nil
}

// SimplifyRbacRoleLists merges a list of Roles with a list of ClusterRoles to create a simpler, unified list
func SimplifyRbacRoleLists(roles []rbac.Role, clusterRoles []rbac.ClusterRole, dsQuery *dataselect.DataSelectQuery) *RbacRoleList {
	items := make([]RbacRole, 0)


	// TODO Take data select query into account


	for _, item := range roles {
		items = append(items,
			RbacRole{
				ObjectMeta: common.NewObjectMeta(item.ObjectMeta),
				TypeMeta:   common.NewTypeMeta(common.ResourceKindRbacRole),
				Name:       item.ObjectMeta.Name,
				Namespace:  item.ObjectMeta.Namespace,
				Rules:      item.Rules,
			})
	}

	for _, item := range clusterRoles {
		items = append(items,
			RbacRole{
				ObjectMeta: common.NewObjectMeta(item.ObjectMeta),
				TypeMeta:   common.NewTypeMeta(common.ResourceKindRbacClusterRole),
				Name:       item.ObjectMeta.Name,
				Namespace:  "",
				Rules:      item.Rules,
			})
	}
	selectedItems := fromCells(dataselect.GenericDataSelect(toCells(items), dsQuery))
	result := &RbacRoleList{
		Items:    selectedItems,
		ListMeta: common.ListMeta{TotalItems: len(roles) + len(clusterRoles)},
	}
	return result
}
