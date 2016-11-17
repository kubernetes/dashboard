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
	client "k8s.io/kubernetes/pkg/client/clientset_generated/internalclientset"
)

// PersistentVolumeClaimDetail provides the presentation layer view of Kubernetes Persistent Volume Claim resource.
type PersistentVolumeClaimDetail struct {
	ObjectMeta  common.ObjectMeta                `json:"objectMeta"`
	TypeMeta    common.TypeMeta                  `json:"typeMeta"`
	Status      api.PersistentVolumeClaimPhase   `json:"status"`
	Volume      string                           `json:"volume"`
	Capacity    api.ResourceList                 `json:"capacity"`
	AccessModes []api.PersistentVolumeAccessMode `json:"accessModes"`
}

// GetPersistentVolumeClaimDetail returns detailed information about a persistent volume claim
func GetPersistentVolumeClaimDetail(client *client.Clientset, namespace string, name string) (*PersistentVolumeClaimDetail, error) {
	log.Printf("Getting details of %s persistent volume claim", name)

	rawPersistentVolumeClaim, err := client.PersistentVolumeClaims(namespace).Get(name)

	if err != nil {
		return nil, err
	}

	return getPersistentVolumeClaimDetail(rawPersistentVolumeClaim), nil
}

func getPersistentVolumeClaimDetail(persistentVolumeClaim *api.PersistentVolumeClaim) *PersistentVolumeClaimDetail {

	return &PersistentVolumeClaimDetail{
		ObjectMeta:  common.NewObjectMeta(persistentVolumeClaim.ObjectMeta),
		TypeMeta:    common.NewTypeMeta(common.ResourceKindPersistentVolumeClaim),
		Status:      persistentVolumeClaim.Status.Phase,
		Volume:      persistentVolumeClaim.Spec.VolumeName,
		Capacity:    persistentVolumeClaim.Status.Capacity,
		AccessModes: persistentVolumeClaim.Spec.AccessModes,
	}
}
