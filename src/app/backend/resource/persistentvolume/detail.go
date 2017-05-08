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
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	client "k8s.io/client-go/kubernetes"
	api "k8s.io/client-go/pkg/api/v1"
)

// PersistentVolumeDetail provides the presentation layer view of Kubernetes Persistent Volume resource.
type PersistentVolumeDetail struct {
	ObjectMeta common.ObjectMeta `json:"objectMeta"`
	TypeMeta   common.TypeMeta   `json:"typeMeta"`

	Status                 api.PersistentVolumePhase         `json:"status"`
	Claim                  string                            `json:"claim"`
	ReclaimPolicy          api.PersistentVolumeReclaimPolicy `json:"reclaimPolicy"`
	AccessModes            []api.PersistentVolumeAccessMode  `json:"accessModes"`
	Capacity               api.ResourceList                  `json:"capacity"`
	Message                string                            `json:"message"`
	PersistentVolumeSource api.PersistentVolumeSource        `json:"persistentVolumeSource"`
}

// GetPersistentVolumeDetail returns detailed information about a persistent volume
func GetPersistentVolumeDetail(client client.Interface, name string) (*PersistentVolumeDetail, error) {
	log.Printf("Getting details of %s persistent volume", name)

	rawPersistentVolume, err := client.CoreV1().PersistentVolumes().Get(name, metaV1.GetOptions{})
	if err != nil {
		return nil, err
	}

	return getPersistentVolumeDetail(rawPersistentVolume), nil
}

func getPersistentVolumeDetail(persistentVolume *api.PersistentVolume) *PersistentVolumeDetail {
	return &PersistentVolumeDetail{
		ObjectMeta:             common.NewObjectMeta(persistentVolume.ObjectMeta),
		TypeMeta:               common.NewTypeMeta(common.ResourceKindPersistentVolume),
		Status:                 persistentVolume.Status.Phase,
		Claim:                  getPersistentVolumeClaim(persistentVolume),
		ReclaimPolicy:          persistentVolume.Spec.PersistentVolumeReclaimPolicy,
		AccessModes:            persistentVolume.Spec.AccessModes,
		Capacity:               persistentVolume.Spec.Capacity,
		Message:                persistentVolume.Status.Message,
		PersistentVolumeSource: persistentVolume.Spec.PersistentVolumeSource,
	}
}
