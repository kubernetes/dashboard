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

package clusterrolebinding

import (
	rbac "k8s.io/api/rbac/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/klog/v2"

	"k8s.io/dashboard/api/pkg/resource/common"
	"k8s.io/dashboard/api/pkg/resource/dataselect"
	"k8s.io/dashboard/errors"
	"k8s.io/dashboard/types"
)

// ClusterRoleBindingList contains a list of clusterRoleBindings in the cluster.
type ClusterRoleBindingList struct {
	ListMeta types.ListMeta       `json:"listMeta"`
	Items    []ClusterRoleBinding `json:"items"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

// ClusterRoleBindingList is a presentation layer view of Kubernetes clusterRoleBindingList. This means it is clusterRoleBindingList plus additional
// augmented data we can get from other sources.
type ClusterRoleBinding struct {
	ObjectMeta types.ObjectMeta `json:"objectMeta"`
	TypeMeta   types.TypeMeta   `json:"typeMeta"`
}

// GetClusterRoleBindingList returns a list of all ClusterRoleBindings in the cluster.
func GetClusterRoleBindingList(client kubernetes.Interface, dsQuery *dataselect.DataSelectQuery) (*ClusterRoleBindingList, error) {
	klog.V(4).Infof("Getting list of all clusterRoleBindings in the cluster")
	channels := &common.ResourceChannels{
		ClusterRoleBindingList: common.GetClusterRoleBindingListChannel(client, 1),
	}

	return GetClusterRoleBindingListFromChannels(channels, dsQuery)
}

// GetClusterRoleBindingListFromChannels returns a list of all ClusterRoleBindings in the cluster
// reading required resource list once from the channels.
func GetClusterRoleBindingListFromChannels(channels *common.ResourceChannels, dsQuery *dataselect.DataSelectQuery) (*ClusterRoleBindingList, error) {
	clusterRoleBindings := <-channels.ClusterRoleBindingList.List
	err := <-channels.ClusterRoleBindingList.Error
	nonCriticalErrors, criticalError := errors.ExtractErrors(err)
	if criticalError != nil {
		return nil, criticalError
	}
	clusterRoleBindingList := toClusterRoleBindingList(clusterRoleBindings.Items, nonCriticalErrors, dsQuery)
	return clusterRoleBindingList, nil
}

func toClusterRoleBinding(clusterRoleBinding rbac.ClusterRoleBinding) ClusterRoleBinding {
	return ClusterRoleBinding{
		ObjectMeta: types.NewObjectMeta(clusterRoleBinding.ObjectMeta),
		TypeMeta:   types.NewTypeMeta(types.ResourceKindClusterRoleBinding),
	}
}

func toClusterRoleBindingList(clusterRoleBindings []rbac.ClusterRoleBinding, nonCriticalErrors []error, dsQuery *dataselect.DataSelectQuery) *ClusterRoleBindingList {
	result := &ClusterRoleBindingList{
		ListMeta: types.ListMeta{TotalItems: len(clusterRoleBindings)},
		Errors:   nonCriticalErrors,
	}

	items := make([]ClusterRoleBinding, 0)
	for _, item := range clusterRoleBindings {
		items = append(items, toClusterRoleBinding(item))
	}

	clusterRoleBindingCells, filteredTotal := dataselect.GenericDataSelectWithFilter(toCells(items), dsQuery)
	result.ListMeta = types.ListMeta{TotalItems: filteredTotal}
	result.Items = fromCells(clusterRoleBindingCells)
	return result
}
