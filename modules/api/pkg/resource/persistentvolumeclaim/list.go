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
	v1 "k8s.io/api/core/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/klog/v2"

	"k8s.io/dashboard/api/pkg/resource/common"
	"k8s.io/dashboard/api/pkg/resource/dataselect"
	"k8s.io/dashboard/errors"
	"k8s.io/dashboard/types"
)

// PersistentVolumeClaimList contains a list of Persistent Volume Claims in the cluster.
type PersistentVolumeClaimList struct {
	ListMeta types.ListMeta `json:"listMeta"`

	// Unordered list of persistent volume claims
	Items []PersistentVolumeClaim `json:"items"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

// PersistentVolumeClaim provides the simplified presentation layer view of Kubernetes Persistent Volume Claim resource.
type PersistentVolumeClaim struct {
	ObjectMeta   types.ObjectMeta                `json:"objectMeta"`
	TypeMeta     types.TypeMeta                  `json:"typeMeta"`
	Status       string                          `json:"status"`
	Volume       string                          `json:"volume"`
	Capacity     v1.ResourceList                 `json:"capacity"`
	AccessModes  []v1.PersistentVolumeAccessMode `json:"accessModes"`
	StorageClass *string                         `json:"storageClass"`
}

// GetPersistentVolumeClaimList returns a list of all Persistent Volume Claims in the cluster.
func GetPersistentVolumeClaimList(client kubernetes.Interface, nsQuery *common.NamespaceQuery,
	dsQuery *dataselect.DataSelectQuery) (*PersistentVolumeClaimList, error) {

	klog.V(4).Infof("Getting list persistent volumes claims")
	channels := &common.ResourceChannels{
		PersistentVolumeClaimList: common.GetPersistentVolumeClaimListChannel(client, nsQuery, 1),
	}

	return GetPersistentVolumeClaimListFromChannels(channels, nsQuery, dsQuery)
}

// GetPersistentVolumeClaimListFromChannels returns a list of all Persistent Volume Claims in the cluster
// reading required resource list once from the channels.
func GetPersistentVolumeClaimListFromChannels(channels *common.ResourceChannels, nsQuery *common.NamespaceQuery,
	dsQuery *dataselect.DataSelectQuery) (*PersistentVolumeClaimList, error) {

	persistentVolumeClaims := <-channels.PersistentVolumeClaimList.List
	err := <-channels.PersistentVolumeClaimList.Error
	nonCriticalErrors, criticalError := errors.ExtractErrors(err)
	if criticalError != nil {
		return nil, criticalError
	}

	return toPersistentVolumeClaimList(persistentVolumeClaims.Items, nonCriticalErrors, dsQuery), nil
}

func toPersistentVolumeClaim(pvc v1.PersistentVolumeClaim) PersistentVolumeClaim {
	return PersistentVolumeClaim{
		ObjectMeta:   types.NewObjectMeta(pvc.ObjectMeta),
		TypeMeta:     types.NewTypeMeta(types.ResourceKindPersistentVolumeClaim),
		Status:       string(pvc.Status.Phase),
		Volume:       pvc.Spec.VolumeName,
		Capacity:     pvc.Status.Capacity,
		AccessModes:  pvc.Spec.AccessModes,
		StorageClass: pvc.Spec.StorageClassName,
	}
}

func toPersistentVolumeClaimList(persistentVolumeClaims []v1.PersistentVolumeClaim, nonCriticalErrors []error,
	dsQuery *dataselect.DataSelectQuery) *PersistentVolumeClaimList {

	result := &PersistentVolumeClaimList{
		Items:    make([]PersistentVolumeClaim, 0),
		ListMeta: types.ListMeta{TotalItems: len(persistentVolumeClaims)},
		Errors:   nonCriticalErrors,
	}

	pvcCells, filteredTotal := dataselect.GenericDataSelectWithFilter(toCells(persistentVolumeClaims), dsQuery)
	persistentVolumeClaims = fromCells(pvcCells)
	result.ListMeta = types.ListMeta{TotalItems: filteredTotal}

	for _, item := range persistentVolumeClaims {
		result.Items = append(result.Items, toPersistentVolumeClaim(item))
	}

	return result
}
