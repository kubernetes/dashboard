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
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/errors"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	rbac "k8s.io/api/rbac/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

// RbacRoleList contains a list of Roles and ClusterRoles in the cluster.
type RbacRoleList struct {
	ListMeta api.ListMeta `json:"listMeta"`

	// Unordered list of RbacRoles
	Items []RbacRole `json:"items"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

// RbacRole provides the simplified, combined presentation layer view of Kubernetes' RBAC Roles and ClusterRoles.
// ClusterRoles will be referred to as Roles for the namespace "all namespaces".
type RbacRole struct {
	ObjectMeta api.ObjectMeta `json:"objectMeta"`
	TypeMeta   api.TypeMeta   `json:"typeMeta"`
}

// GetRbacRoleList returns a list of all RBAC Roles in the cluster.
func GetRbacRoleList(client kubernetes.Interface, dsQuery *dataselect.DataSelectQuery) (*RbacRoleList, error) {
	log.Println("Getting list of RBAC roles")
	channels := &common.ResourceChannels{
		RoleList:        common.GetRoleListChannel(client, 1),
		ClusterRoleList: common.GetClusterRoleListChannel(client, 1),
	}

	return GetRbacRoleListFromChannels(channels, dsQuery)
}

// GetRbacRoleListFromChannels returns a list of all RBAC roles in the cluster reading required resource list once from the channels.
func GetRbacRoleListFromChannels(channels *common.ResourceChannels, dsQuery *dataselect.DataSelectQuery) (*RbacRoleList, error) {
	roles := <-channels.RoleList.List
	err := <-channels.RoleList.Error
	nonCriticalErrors, criticalError := errors.HandleError(err)
	if criticalError != nil {
		return nil, criticalError
	}

	clusterRoles := <-channels.ClusterRoleList.List
	err = <-channels.ClusterRoleList.Error
	nonCriticalErrors, err = errors.AppendError(err, nonCriticalErrors)
	if criticalError != nil {
		return nil, criticalError
	}

	result := toRbacRoleLists(roles.Items, clusterRoles.Items, nonCriticalErrors, dsQuery)
	return result, nil
}

func toRbacRole(meta v1.ObjectMeta, kind api.ResourceKind) RbacRole {
	return RbacRole{
		ObjectMeta: api.NewObjectMeta(meta),
		TypeMeta:   api.NewTypeMeta(kind),
	}
}

// toRbacRoleLists merges a list of Roles with a list of ClusterRoles to create a simpler, unified list
func toRbacRoleLists(roles []rbac.Role, clusterRoles []rbac.ClusterRole, nonCriticalErrors []error,
	dsQuery *dataselect.DataSelectQuery) *RbacRoleList {

	result := &RbacRoleList{
		ListMeta: api.ListMeta{TotalItems: len(roles) + len(clusterRoles)},
		Errors:   nonCriticalErrors,
	}

	items := make([]RbacRole, 0)
	for _, item := range roles {
		items = append(items, toRbacRole(item.ObjectMeta, api.ResourceKindRbacRole))
	}

	for _, item := range clusterRoles {
		items = append(items, toRbacRole(item.ObjectMeta, api.ResourceKindRbacClusterRole))
	}

	roleCells, filteredTotal := dataselect.GenericDataSelectWithFilter(toCells(items), dsQuery)
	result.ListMeta = api.ListMeta{TotalItems: filteredTotal}
	result.Items = fromCells(roleCells)
	return result
}
