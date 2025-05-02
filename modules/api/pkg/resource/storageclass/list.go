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

package storageclass

import (
	storage "k8s.io/api/storage/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/klog/v2"

	"k8s.io/dashboard/api/pkg/resource/common"
	"k8s.io/dashboard/api/pkg/resource/dataselect"
	"k8s.io/dashboard/errors"
	"k8s.io/dashboard/types"
)

// StorageClassList holds a list of Storage Class objects in the cluster.
type StorageClassList struct {
	ListMeta types.ListMeta `json:"listMeta"`
	Items    []StorageClass `json:"items"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

// StorageClass is a representation of a Kubernetes Storage Class object.
type StorageClass struct {
	ObjectMeta  types.ObjectMeta  `json:"objectMeta"`
	TypeMeta    types.TypeMeta    `json:"typeMeta"`
	Provisioner string            `json:"provisioner"`
	Parameters  map[string]string `json:"parameters"`
}

// GetStorageClassList returns a list of all storage class objects in the cluster.
func GetStorageClassList(client kubernetes.Interface, dsQuery *dataselect.DataSelectQuery) (
	*StorageClassList, error) {
	klog.V(4).Infof("Getting list of storage classes in the cluster")

	channels := &common.ResourceChannels{
		StorageClassList: common.GetStorageClassListChannel(client, 1),
	}

	return GetStorageClassListFromChannels(channels, dsQuery)
}

// GetStorageClassListFromChannels returns a list of all storage class objects in the cluster.
func GetStorageClassListFromChannels(channels *common.ResourceChannels,
	dsQuery *dataselect.DataSelectQuery) (*StorageClassList, error) {
	storageClasses := <-channels.StorageClassList.List
	err := <-channels.StorageClassList.Error
	nonCriticalErrors, criticalError := errors.ExtractErrors(err)
	if criticalError != nil {
		return nil, criticalError
	}

	return toStorageClassList(storageClasses.Items, nonCriticalErrors, dsQuery), nil
}

func toStorageClassList(storageClasses []storage.StorageClass, nonCriticalErrors []error,
	dsQuery *dataselect.DataSelectQuery) *StorageClassList {

	storageClassList := &StorageClassList{
		Items:    make([]StorageClass, 0),
		ListMeta: types.ListMeta{TotalItems: len(storageClasses)},
		Errors:   nonCriticalErrors,
	}

	storageClassCells, filteredTotal := dataselect.GenericDataSelectWithFilter(toCells(storageClasses), dsQuery)
	storageClasses = fromCells(storageClassCells)
	storageClassList.ListMeta = types.ListMeta{TotalItems: filteredTotal}

	for _, storageClass := range storageClasses {
		storageClassList.Items = append(storageClassList.Items, toStorageClass(&storageClass))
	}

	return storageClassList
}

func toStorageClass(storageClass *storage.StorageClass) StorageClass {
	return StorageClass{
		ObjectMeta:  types.NewObjectMeta(storageClass.ObjectMeta),
		TypeMeta:    types.NewTypeMeta(types.ResourceKindStorageClass),
		Provisioner: storageClass.Provisioner,
		Parameters:  storageClass.Parameters,
	}
}
