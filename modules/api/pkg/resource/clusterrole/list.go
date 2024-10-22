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
	rbac "k8s.io/api/rbac/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/klog/v2"

	"k8s.io/dashboard/api/pkg/resource/common"
	"k8s.io/dashboard/api/pkg/resource/dataselect"
	"k8s.io/dashboard/errors"
	"k8s.io/dashboard/types"
)

type ClusterRoleList struct {
	ListMeta types.ListMeta `json:"listMeta"`
	Items    []ClusterRole  `json:"items"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

type ClusterRole struct {
	ObjectMeta types.ObjectMeta `json:"objectMeta"`
	TypeMeta   types.TypeMeta   `json:"typeMeta"`
}

func GetClusterRoleList(client kubernetes.Interface, dsQuery *dataselect.DataSelectQuery) (*ClusterRoleList, error) {
	klog.V(4).Info("Getting list of RBAC roles")
	channels := &common.ResourceChannels{
		ClusterRoleList: common.GetClusterRoleListChannel(client, 1),
	}

	return GetClusterRoleListFromChannels(channels, dsQuery)
}

func GetClusterRoleListFromChannels(channels *common.ResourceChannels, dsQuery *dataselect.DataSelectQuery) (*ClusterRoleList, error) {
	clusterRoles := <-channels.ClusterRoleList.List
	err := <-channels.ClusterRoleList.Error
	nonCriticalErrors, criticalError := errors.ExtractErrors(err)
	if criticalError != nil {
		return nil, criticalError
	}

	result := toClusterRoleLists(clusterRoles.Items, nonCriticalErrors, dsQuery)
	return result, nil
}

func toClusterRole(role rbac.ClusterRole) ClusterRole {
	return ClusterRole{
		ObjectMeta: types.NewObjectMeta(role.ObjectMeta),
		TypeMeta:   types.NewTypeMeta(types.ResourceKindClusterRole),
	}
}

// toClusterRoleLists merges a list of Roles with a list of ClusterRoles to create a simpler, unified list
func toClusterRoleLists(clusterRoles []rbac.ClusterRole, nonCriticalErrors []error,
	dsQuery *dataselect.DataSelectQuery) *ClusterRoleList {
	result := &ClusterRoleList{
		ListMeta: types.ListMeta{TotalItems: len(clusterRoles)},
		Errors:   nonCriticalErrors,
	}

	items := make([]ClusterRole, 0)
	for _, item := range clusterRoles {
		items = append(items, toClusterRole(item))
	}

	roleCells, filteredTotal := dataselect.GenericDataSelectWithFilter(toCells(items), dsQuery)
	result.ListMeta = types.ListMeta{TotalItems: filteredTotal}
	result.Items = fromCells(roleCells)
	return result
}
