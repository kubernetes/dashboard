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
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/errors"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	storage "k8s.io/api/storage/v1"
	"k8s.io/client-go/kubernetes"
)

// StorageClassList holds a list of storage class objects in the cluster.
type StorageClassList struct {
	ListMeta       api.ListMeta   `json:"listMeta"`
	StorageClasses []StorageClass `json:"storageClasses"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

// GetStorageClassList returns a list of all storage class objects in the cluster.
func GetStorageClassList(client kubernetes.Interface, dsQuery *dataselect.DataSelectQuery) (
	*StorageClassList, error) {
	log.Print("Getting list of storage classes in the cluster")

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
	nonCriticalErrors, criticalError := errors.HandleError(err)
	if criticalError != nil {
		return nil, criticalError
	}

	return toStorageClassList(storageClasses.Items, nonCriticalErrors, dsQuery), nil
}

func toStorageClassList(storageClasses []storage.StorageClass, nonCriticalErrors []error,
	dsQuery *dataselect.DataSelectQuery) *StorageClassList {

	storageClassList := &StorageClassList{
		StorageClasses: make([]StorageClass, 0),
		ListMeta:       api.ListMeta{TotalItems: len(storageClasses)},
		Errors:         nonCriticalErrors,
	}

	storageClassCells, filteredTotal := dataselect.GenericDataSelectWithFilter(toCells(storageClasses), dsQuery)
	storageClasses = fromCells(storageClassCells)
	storageClassList.ListMeta = api.ListMeta{TotalItems: filteredTotal}

	for _, storageClass := range storageClasses {
		storageClassList.StorageClasses = append(storageClassList.StorageClasses, toStorageClass(&storageClass))
	}

	return storageClassList
}
