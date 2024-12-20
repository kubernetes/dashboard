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

package role

import (
	rbac "k8s.io/api/rbac/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/klog/v2"

	"k8s.io/dashboard/api/pkg/resource/common"
	"k8s.io/dashboard/api/pkg/resource/dataselect"
	"k8s.io/dashboard/errors"
	"k8s.io/dashboard/types"
)

// RoleList contains a list of role in the cluster.
type RoleList struct {
	ListMeta types.ListMeta `json:"listMeta"`
	Items    []Role         `json:"items"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

// Role is a presentation layer view of Kubernetes role. This means it is role plus additional
// augmented data we can get from other sources.
type Role struct {
	ObjectMeta types.ObjectMeta `json:"objectMeta"`
	TypeMeta   types.TypeMeta   `json:"typeMeta"`
}

// GetRoleList returns a list of all Roles in the cluster.
func GetRoleList(client kubernetes.Interface, nsQuery *common.NamespaceQuery, dsQuery *dataselect.DataSelectQuery) (*RoleList, error) {
	klog.V(4).Infof("Getting list of all roles in the cluster")
	channels := &common.ResourceChannels{
		RoleList: common.GetRoleListChannel(client, nsQuery, 1),
	}

	return GetRoleListFromChannels(channels, dsQuery)
}

// GetRoleListFromChannels returns a list of all Roles in the cluster
// reading required resource list once from the channels.
func GetRoleListFromChannels(channels *common.ResourceChannels, dsQuery *dataselect.DataSelectQuery) (*RoleList, error) {
	roles := <-channels.RoleList.List
	err := <-channels.RoleList.Error
	nonCriticalErrors, criticalError := errors.ExtractErrors(err)
	if criticalError != nil {
		return nil, criticalError
	}
	roleList := toRoleList(roles.Items, nonCriticalErrors, dsQuery)
	return roleList, nil
}

func toRole(role rbac.Role) Role {
	return Role{
		ObjectMeta: types.NewObjectMeta(role.ObjectMeta),
		TypeMeta:   types.NewTypeMeta(types.ResourceKindRole),
	}
}

func toRoleList(roles []rbac.Role, nonCriticalErrors []error, dsQuery *dataselect.DataSelectQuery) *RoleList {
	result := &RoleList{
		ListMeta: types.ListMeta{TotalItems: len(roles)},
		Errors:   nonCriticalErrors,
	}

	items := make([]Role, 0)
	for _, item := range roles {
		items = append(items, toRole(item))
	}

	roleCells, filteredTotal := dataselect.GenericDataSelectWithFilter(toCells(items), dsQuery)
	result.ListMeta = types.ListMeta{TotalItems: filteredTotal}
	result.Items = fromCells(roleCells)
	return result
}
