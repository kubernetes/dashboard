// Copyright 2015 Google Inc. All Rights Reserved.
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

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"k8s.io/client-go/kubernetes"
	storage "k8s.io/client-go/pkg/apis/storage/v1beta1"
)

// TODO
type StorageClassList struct {
	ListMeta common.ListMeta `json:"listMeta"`

	// Unordered list of storage classes.
	StorageClasses []StorageClass `json:"storageClasses"`
}

func GetStorageClassList(client kubernetes.Interface, dsQuery *dataselect.DataSelectQuery) (*StorageClassList, error) {
	log.Printf("Getting list of storage classes in the cluster")

	channels := &common.ResourceChannels{
		StorageClassList: common.GetStorageClassListChannel(client, 1),
	}

	return GetStorageClassListFromChannels(channels, dsQuery)
}

func GetStorageClassListFromChannels(channels *common.ResourceChannels, dsQuery *dataselect.DataSelectQuery) (*StorageClassList, error) {
	storageClasses := <-channels.StorageClassList.List
	if err := <-channels.StorageClassList.Error; err != nil {
		return nil, err
	}

	return CreateStorageClassList(storageClasses.Items, dsQuery), nil
}

func CreateStorageClassList(storageClasses []storage.StorageClass, dsQuery *dataselect.DataSelectQuery) *StorageClassList {
	storageClassList := &StorageClassList{
		StorageClasses: make([]StorageClass, 0),
		ListMeta:       common.ListMeta{TotalItems: len(storageClasses)},
	}

	storageClasses = fromCells(dataselect.GenericDataSelect(toCells(storageClasses), dsQuery))

	for _, storageClass := range storageClasses {
		storageClassList.StorageClasses = append(storageClassList.StorageClasses, ToStorageClass(&storageClass))
	}

	return storageClassList
}
