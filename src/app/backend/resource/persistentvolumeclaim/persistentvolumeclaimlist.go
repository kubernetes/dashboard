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

package persistentvolumeclaim

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"k8s.io/kubernetes/pkg/api"
	client "k8s.io/kubernetes/pkg/client/unversioned"
)

// PersistentVolumeClaimList contains a list of Persistent Volume Claims in the cluster.
type PersistentVolumeClaimList struct {
	ListMeta common.ListMeta `json:"listMeta"`

	// Unordered list of persistent volume claims
	Items []PersistentVolumeClaim `json:"items"`
}

// PersistentVolumeClaim provides the simplified presentation layer view of Kubernetes Persistent Volume Claim resource.
type PersistentVolumeClaim struct {
	ObjectMeta common.ObjectMeta `json:"objectMeta"`
	TypeMeta   common.TypeMeta   `json:"typeMeta"`

	// No additional info in the list object.
}

// GetPersistentVolumeClaimList returns a list of all Persistent Volume Claims in the cluster.
func GetPersistentVolumeClaimList(client *client.Client, nsQuery *common.NamespaceQuery, pQuery *common.PaginationQuery) (*PersistentVolumeClaimList, error) {
	log.Printf("Getting list persistent volumes claims")
	channels := &common.ResourceChannels{
		PersistentVolumeClaimList: common.GetPersistentVolumeClaimListChannel(client, nsQuery, 1),
	}

	return GetPersistentVolumeClaimListFromChannels(channels, nsQuery, pQuery)
}

// GetPersistentVolumeClaimListFromChannels returns a list of all Persistent Volume Claims in the cluster
// reading required resource list once from the channels.
func GetPersistentVolumeClaimListFromChannels(channels *common.ResourceChannels, nsQuery *common.NamespaceQuery, pQuery *common.PaginationQuery) (
	*PersistentVolumeClaimList, error) {

	persistentVolumeClaims := <-channels.PersistentVolumeClaimList.List
	if err := <-channels.PersistentVolumeClaimList.Error; err != nil {
		return nil, err
	}

	result := getPersistentVolumeClaimList(persistentVolumeClaims.Items, nsQuery, pQuery)

	return result, nil
}

func getPersistentVolumeClaimList(persistentVolumeClaims []api.PersistentVolumeClaim, nsQuery *common.NamespaceQuery, pQuery *common.PaginationQuery) *PersistentVolumeClaimList {

	result := &PersistentVolumeClaimList{
		Items:    make([]PersistentVolumeClaim, 0),
		ListMeta: common.ListMeta{TotalItems: len(persistentVolumeClaims)},
	}

	persistentVolumeClaims = paginate(persistentVolumeClaims, pQuery)

	for _, item := range persistentVolumeClaims {
		result.Items = append(result.Items,
			PersistentVolumeClaim{
				ObjectMeta: common.NewObjectMeta(item.ObjectMeta),
				TypeMeta:   common.NewTypeMeta(common.ResourceKindPersistenceVolumeClaim),
			})
	}

	return result
}
