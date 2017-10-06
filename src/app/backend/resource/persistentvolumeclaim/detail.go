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

package persistentvolumeclaim

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

// PersistentVolumeClaimDetail provides the presentation layer view of Kubernetes Persistent Volume Claim resource.
type PersistentVolumeClaimDetail struct {
	ObjectMeta   api.ObjectMeta                  `json:"objectMeta"`
	TypeMeta     api.TypeMeta                    `json:"typeMeta"`
	Status       v1.PersistentVolumeClaimPhase   `json:"status"`
	Volume       string                          `json:"volume"`
	Capacity     v1.ResourceList                 `json:"capacity"`
	AccessModes  []v1.PersistentVolumeAccessMode `json:"accessModes"`
	StorageClass *string                         `json:"storageClass"`
}

// GetPersistentVolumeClaimDetail returns detailed information about a persistent volume claim
func GetPersistentVolumeClaimDetail(client kubernetes.Interface, namespace string, name string) (*PersistentVolumeClaimDetail, error) {
	log.Printf("Getting details of %s persistent volume claim", name)

	rawPersistentVolumeClaim, err := client.CoreV1().PersistentVolumeClaims(namespace).Get(name, metaV1.GetOptions{})

	if err != nil {
		return nil, err
	}

	return getPersistentVolumeClaimDetail(rawPersistentVolumeClaim), nil
}

func getPersistentVolumeClaimDetail(persistentVolumeClaim *v1.PersistentVolumeClaim) *PersistentVolumeClaimDetail {

	return &PersistentVolumeClaimDetail{
		ObjectMeta:   api.NewObjectMeta(persistentVolumeClaim.ObjectMeta),
		TypeMeta:     api.NewTypeMeta(api.ResourceKindPersistentVolumeClaim),
		Status:       persistentVolumeClaim.Status.Phase,
		Volume:       persistentVolumeClaim.Spec.VolumeName,
		Capacity:     persistentVolumeClaim.Status.Capacity,
		AccessModes:  persistentVolumeClaim.Spec.AccessModes,
		StorageClass: persistentVolumeClaim.Spec.StorageClassName,
	}
}
