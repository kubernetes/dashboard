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

package storage

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/client"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/persistentvolumeclaim"
	k8sClient "k8s.io/client-go/kubernetes"
)

// Storage structure contains all resource lists grouped into the storage category.
type Storage struct {
	PersistentVolumeClaimList persistentvolumeclaim.PersistentVolumeClaimList `json:"persistentVolumeClaimList"`
}

// GetStorage returns a list of all storage resources in the cluster.
func GetStorage(client *k8sClient.Clientset, heapsterClient client.HeapsterClient,
	nsQuery *common.NamespaceQuery, dsQuery *dataselect.DataSelectQuery) (*Storage, error) {

	log.Print("Getting lists of storage")
	channels := &common.ResourceChannels{
		PersistentVolumeClaimList: common.GetPersistentVolumeClaimListChannel(client, nsQuery, 1),
	}

	return GetStorageFromChannels(channels, heapsterClient, dsQuery, nsQuery)
}

// GetStorageFromChannels returns a list of storage resources in the cluster, from the channel sources.
func GetStorageFromChannels(channels *common.ResourceChannels, heapsterClient client.HeapsterClient,
	dsQuery *dataselect.DataSelectQuery, nsQuery *common.NamespaceQuery) (*Storage, error) {

	pvcChan := make(chan *persistentvolumeclaim.PersistentVolumeClaimList)
	errChan := make(chan error, 1)

	go func() {
		pvcList, err := persistentvolumeclaim.GetPersistentVolumeClaimListFromChannels(channels, nsQuery, dsQuery)
		errChan <- err
		pvcChan <- pvcList
	}()

	pvcList := <-pvcChan
	err := <-errChan
	if err != nil {
		return nil, err
	}

	return &Storage{
		PersistentVolumeClaimList: *pvcList,
	}, nil
}
