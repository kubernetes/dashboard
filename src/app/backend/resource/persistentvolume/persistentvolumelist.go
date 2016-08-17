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

package persistentvolume

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"k8s.io/kubernetes/pkg/api"
	client "k8s.io/kubernetes/pkg/client/unversioned"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
)

// PersistentVolumeList contains a list of Persistent Volumes in the cluster.
type PersistentVolumeList struct {
	ListMeta common.ListMeta `json:"listMeta"`

	// Unordered list of Config Maps
	Items []PersistentVolume `json:"items"`
}

// PersistentVolume provides the simplified presentation layer view of Kubernetes Persistent Volume resource.
type PersistentVolume struct {
	ObjectMeta common.ObjectMeta `json:"objectMeta"`
	TypeMeta   common.TypeMeta   `json:"typeMeta"`

	// No additional info in the list object.
}

// GetPersistentVolumeList returns a list of all Persistent Volumes in the cluster.
func GetPersistentVolumeList(client *client.Client, dsQuery *dataselect.DataSelectQuery) (*PersistentVolumeList, error) {
	log.Printf("Getting list persistent volumes")
	channels := &common.ResourceChannels{
		PersistentVolumeList: common.GetPersistentVolumeListChannel(client, 1),
	}

	return GetPersistentVolumeListFromChannels(channels, dsQuery)
}

// GetPersistentVolumeListFromChannels returns a list of all Persistent Volumes in the cluster
// reading required resource list once from the channels.
func GetPersistentVolumeListFromChannels(channels *common.ResourceChannels, dsQuery *dataselect.DataSelectQuery) (
	*PersistentVolumeList, error) {

	persistentVolumes := <-channels.PersistentVolumeList.List
	if err := <-channels.PersistentVolumeList.Error; err != nil {
		return nil, err
	}

	result := getPersistentVolumeList(persistentVolumes.Items, dsQuery)

	return result, nil
}

func getPersistentVolumeList(persistentVolumes []api.PersistentVolume, dsQuery *dataselect.DataSelectQuery) *PersistentVolumeList {
	result := &PersistentVolumeList{
		Items:    make([]PersistentVolume, 0),
		ListMeta: common.ListMeta{TotalItems: len(persistentVolumes)},
	}

	persistentVolumes = fromCells(dataselect.GenericDataSelect(toCells(persistentVolumes), dsQuery))

	for _, item := range persistentVolumes {
		result.Items = append(result.Items,
			PersistentVolume{
				ObjectMeta: common.NewObjectMeta(item.ObjectMeta),
				TypeMeta:   common.NewTypeMeta(common.ResourceKindPersistentVolume),
			})
	}

	return result
}
