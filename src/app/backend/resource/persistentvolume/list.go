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

package persistentvolume

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/errors"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	v1 "k8s.io/api/core/v1"
	"k8s.io/client-go/kubernetes"
)

// PersistentVolumeList contains a list of Persistent Volumes in the cluster.
type PersistentVolumeList struct {
	ListMeta api.ListMeta       `json:"listMeta"`
	Items    []PersistentVolume `json:"items"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

// PersistentVolume provides the simplified presentation layer view of Kubernetes Persistent Volume resource.
type PersistentVolume struct {
	ObjectMeta    api.ObjectMeta                   `json:"objectMeta"`
	TypeMeta      api.TypeMeta                     `json:"typeMeta"`
	Capacity      v1.ResourceList                  `json:"capacity"`
	AccessModes   []v1.PersistentVolumeAccessMode  `json:"accessModes"`
	ReclaimPolicy v1.PersistentVolumeReclaimPolicy `json:"reclaimPolicy"`
	StorageClass  string                           `json:"storageClass"`
	MountOptions  []string                         `json:"mountOptions"`
	Status        v1.PersistentVolumePhase         `json:"status"`
	Claim         string                           `json:"claim"`
	Reason        string                           `json:"reason"`
}

// GetPersistentVolumeList returns a list of all Persistent Volumes in the cluster.
func GetPersistentVolumeList(client kubernetes.Interface, dsQuery *dataselect.DataSelectQuery) (*PersistentVolumeList, error) {
	log.Print("Getting list persistent volumes")
	channels := &common.ResourceChannels{
		PersistentVolumeList: common.GetPersistentVolumeListChannel(client, 1),
	}

	return GetPersistentVolumeListFromChannels(channels, dsQuery)
}

// GetPersistentVolumeListFromChannels returns a list of all Persistent Volumes in the cluster
// reading required resource list once from the channels.
func GetPersistentVolumeListFromChannels(channels *common.ResourceChannels, dsQuery *dataselect.DataSelectQuery) (*PersistentVolumeList, error) {
	persistentVolumes := <-channels.PersistentVolumeList.List
	err := <-channels.PersistentVolumeList.Error

	nonCriticalErrors, criticalError := errors.HandleError(err)
	if criticalError != nil {
		return nil, criticalError
	}

	return toPersistentVolumeList(persistentVolumes.Items, nonCriticalErrors, dsQuery), nil
}

func toPersistentVolumeList(persistentVolumes []v1.PersistentVolume, nonCriticalErrors []error,
	dsQuery *dataselect.DataSelectQuery) *PersistentVolumeList {

	result := &PersistentVolumeList{
		Items:    make([]PersistentVolume, 0),
		ListMeta: api.ListMeta{TotalItems: len(persistentVolumes)},
		Errors:   nonCriticalErrors,
	}

	pvCells, filteredTotal := dataselect.GenericDataSelectWithFilter(toCells(persistentVolumes), dsQuery)
	persistentVolumes = fromCells(pvCells)
	result.ListMeta = api.ListMeta{TotalItems: filteredTotal}

	for _, item := range persistentVolumes {
		result.Items = append(result.Items, toPersistentVolume(item))
	}

	return result
}

func toPersistentVolume(pv v1.PersistentVolume) PersistentVolume {
	return PersistentVolume{
		ObjectMeta:    api.NewObjectMeta(pv.ObjectMeta),
		TypeMeta:      api.NewTypeMeta(api.ResourceKindPersistentVolume),
		Capacity:      pv.Spec.Capacity,
		AccessModes:   pv.Spec.AccessModes,
		ReclaimPolicy: pv.Spec.PersistentVolumeReclaimPolicy,
		StorageClass:  pv.Spec.StorageClassName,
		MountOptions:  pv.Spec.MountOptions,
		Status:        pv.Status.Phase,
		Claim:         getPersistentVolumeClaim(&pv),
		Reason:        pv.Status.Reason,
	}
}
