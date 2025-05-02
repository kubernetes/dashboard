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

package rolebinding

import (
	rbac "k8s.io/api/rbac/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/klog/v2"

	"k8s.io/dashboard/api/pkg/resource/common"
	"k8s.io/dashboard/api/pkg/resource/dataselect"
	"k8s.io/dashboard/errors"
	"k8s.io/dashboard/types"
)

// RoleBindingList contains a list of roleBindings in the cluster.
type RoleBindingList struct {
	ListMeta types.ListMeta `json:"listMeta"`
	Items    []RoleBinding  `json:"items"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

// RoleBinding is a presentation layer view of Kubernetes roleBinding. This means it is roleBinding plus additional
// augmented data we can get from other sources.
type RoleBinding struct {
	ObjectMeta types.ObjectMeta `json:"objectMeta"`
	TypeMeta   types.TypeMeta   `json:"typeMeta"`
}

// GetRoleBindingList returns a list of all RoleBindings in the cluster.
func GetRoleBindingList(client kubernetes.Interface, nsQuery *common.NamespaceQuery, dsQuery *dataselect.DataSelectQuery) (*RoleBindingList, error) {
	klog.V(4).Infof("Getting list of all roleBindings in the cluster")
	channels := &common.ResourceChannels{
		RoleBindingList: common.GetRoleBindingListChannel(client, nsQuery, 1),
	}

	return GetRoleBindingListFromChannels(channels, dsQuery)
}

// GetRoleBindingListFromChannels returns a list of all RoleBindings in the cluster
// reading required resource list once from the channels.
func GetRoleBindingListFromChannels(channels *common.ResourceChannels, dsQuery *dataselect.DataSelectQuery) (*RoleBindingList, error) {
	roleBindings := <-channels.RoleBindingList.List
	err := <-channels.RoleBindingList.Error
	nonCriticalErrors, criticalError := errors.ExtractErrors(err)
	if criticalError != nil {
		return nil, criticalError
	}
	roleBindingList := toRoleBindingList(roleBindings.Items, nonCriticalErrors, dsQuery)
	return roleBindingList, nil
}

func toRoleBinding(roleBinding rbac.RoleBinding) RoleBinding {
	return RoleBinding{
		ObjectMeta: types.NewObjectMeta(roleBinding.ObjectMeta),
		TypeMeta:   types.NewTypeMeta(types.ResourceKindRoleBinding),
	}
}

func toRoleBindingList(roleBindings []rbac.RoleBinding, nonCriticalErrors []error, dsQuery *dataselect.DataSelectQuery) *RoleBindingList {
	result := &RoleBindingList{
		ListMeta: types.ListMeta{TotalItems: len(roleBindings)},
		Errors:   nonCriticalErrors,
	}

	items := make([]RoleBinding, 0)
	for _, item := range roleBindings {
		items = append(items, toRoleBinding(item))
	}

	roleBindingCells, filteredTotal := dataselect.GenericDataSelectWithFilter(toCells(items), dsQuery)
	result.ListMeta = types.ListMeta{TotalItems: filteredTotal}
	result.Items = fromCells(roleBindingCells)
	return result
}
