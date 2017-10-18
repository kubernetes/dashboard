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
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	rbac "k8s.io/api/rbac/v1"
	"k8s.io/client-go/kubernetes"
)

// RbacRoleBindingList contains a list of Roles and ClusterRoles in the cluster.
type RbacRoleBindingList struct {
	ListMeta api.ListMeta `json:"listMeta"`

	// Unordered list of RbacRoleBindings
	Items []RbacRoleBinding `json:"items"`
}

// RbacRoleBinding provides the simplified, combined presentation layer view of Kubernetes' RBAC RoleBindings and ClusterRoleBindings.
// ClusterRoleBindings will be referred to as RoleBindings for the namespace "all namespaces".
type RbacRoleBinding struct {
	ObjectMeta api.ObjectMeta `json:"objectMeta"`
	TypeMeta   api.TypeMeta   `json:"typeMeta"`
	Subjects   []rbac.Subject `json:"subjects"`
	RoleRef    rbac.RoleRef   `json:"roleRef"`
	Name       string         `json:"name"`
	Namespace  string         `json:"namespace"`
}

// GetRbacRoleBindingList returns a list of all RBAC Role Bindings in the cluster.
func GetRbacRoleBindingList(client kubernetes.Interface, dsQuery *dataselect.DataSelectQuery) (*RbacRoleBindingList, error) {
	log.Print("Getting list rbac role bindings")
	channels := &common.ResourceChannels{
		RoleList:        common.GetRoleListChannel(client, 1),
		ClusterRoleList: common.GetClusterRoleListChannel(client, 1),
	}

	return GetRbacRoleBindingListFromChannels(channels, dsQuery)
}

// GetRbacRoleBindingListFromChannels returns a list of all RoleBindings in the cluster
// reading required resource list once from the channels.
func GetRbacRoleBindingListFromChannels(channels *common.ResourceChannels, dsQuery *dataselect.DataSelectQuery) (
	*RbacRoleBindingList, error) {

	roleBindings := <-channels.RoleBindingList.List
	if err := <-channels.RoleBindingList.Error; err != nil {
		return nil, err
	}
	clusterRoleBindings := <-channels.ClusterRoleBindingList.List
	if err := <-channels.ClusterRoleBindingList.Error; err != nil {
		return nil, err
	}

	result := SimplifyRbacRoleBindingLists(roleBindings.Items, clusterRoleBindings.Items, dsQuery)

	return result, nil
}

// SimplifyRbacRoleBindingLists merges a list of RoleBindings with a list of ClusterRoleBindings to create a simpler, unified list
func SimplifyRbacRoleBindingLists(roleBindings []rbac.RoleBinding, clusterRoleBindings []rbac.ClusterRoleBinding, dsQuery *dataselect.DataSelectQuery) *RbacRoleBindingList {
	items := make([]RbacRoleBinding, 0)

	for _, item := range roleBindings {
		items = append(items,
			RbacRoleBinding{
				ObjectMeta: api.NewObjectMeta(item.ObjectMeta),
				TypeMeta:   api.NewTypeMeta(api.ResourceKindRbacRoleBinding),
				Name:       item.ObjectMeta.Name,
				Namespace:  item.ObjectMeta.Namespace,
				RoleRef:    item.RoleRef,
				Subjects:   item.Subjects,
			})
	}

	for _, item := range clusterRoleBindings {
		items = append(items,
			RbacRoleBinding{
				ObjectMeta: api.NewObjectMeta(item.ObjectMeta),
				TypeMeta:   api.NewTypeMeta(api.ResourceKindRbacClusterRoleBinding),
				Name:       item.ObjectMeta.Name,
				Namespace:  "",
				RoleRef:    item.RoleRef,
				Subjects:   item.Subjects,
			})
	}
	selectedItems := fromCells(dataselect.GenericDataSelect(toCells(items), dsQuery))
	result := &RbacRoleBindingList{
		Items:    selectedItems,
		ListMeta: api.ListMeta{TotalItems: len(roleBindings) + len(clusterRoleBindings)},
	}
	return result
}
