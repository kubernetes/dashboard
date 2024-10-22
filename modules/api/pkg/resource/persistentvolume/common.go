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
	"context"
	"strings"

	v1 "k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	client "k8s.io/client-go/kubernetes"
	"k8s.io/klog/v2"

	"k8s.io/dashboard/api/pkg/args"
	"k8s.io/dashboard/api/pkg/resource/common"
	"k8s.io/dashboard/api/pkg/resource/dataselect"
	"k8s.io/dashboard/errors"
)

// GetStorageClassPersistentVolumes gets persistentvolumes that are associated with this storageclass.
func GetStorageClassPersistentVolumes(client client.Interface, storageClassName string,
	dsQuery *dataselect.DataSelectQuery) (*PersistentVolumeList, error) {

	storageClass, err := client.StorageV1().StorageClasses().Get(context.TODO(), storageClassName, metaV1.GetOptions{})

	if err != nil {
		return nil, err
	}

	channels := &common.ResourceChannels{
		PersistentVolumeList: common.GetPersistentVolumeListChannel(
			client, 1),
	}

	persistentVolumeList := <-channels.PersistentVolumeList.List

	err = <-channels.PersistentVolumeList.Error
	nonCriticalErrors, criticalError := errors.ExtractErrors(err)
	if criticalError != nil {
		return nil, criticalError
	}

	storagePersistentVolumes := make([]v1.PersistentVolume, 0)
	for _, pv := range persistentVolumeList.Items {
		if strings.Compare(pv.Spec.StorageClassName, storageClass.Name) == 0 {
			storagePersistentVolumes = append(storagePersistentVolumes, pv)
		}
	}

	klog.V(args.LogLevelVerbose).Infof("Found %d persistentvolumes related to %s storageclass",
		len(storagePersistentVolumes), storageClassName)

	return toPersistentVolumeList(storagePersistentVolumes, nonCriticalErrors, dsQuery), nil
}

// getPersistentVolumeClaim returns Persistent Volume claim using "namespace/claim" format.
func getPersistentVolumeClaim(pv *v1.PersistentVolume) string {
	var claim string

	if pv.Spec.ClaimRef != nil {
		claim = pv.Spec.ClaimRef.Namespace + "/" + pv.Spec.ClaimRef.Name
	}

	return claim
}

// PersistentVolumeCell allows to perform complex data section on []api.PersistentVolume.
type PersistentVolumeCell v1.PersistentVolume

// GetProperty allows to perform complex data section on PersistentVolumeCell.
func (self PersistentVolumeCell) GetProperty(name dataselect.PropertyName) dataselect.ComparableValue {
	switch name {
	case dataselect.NameProperty:
		return dataselect.StdComparableString(self.ObjectMeta.Name)
	case dataselect.CreationTimestampProperty:
		return dataselect.StdComparableTime(self.ObjectMeta.CreationTimestamp.Time)
	case dataselect.NamespaceProperty:
		return dataselect.StdComparableString(self.ObjectMeta.Namespace)
	case dataselect.StatusProperty:
		return dataselect.StdComparableString(self.Status.Phase)
	default:
		// if name is not supported then just return a constant dummy value, sort will have no effect.
		return nil
	}
}

// toCells converts []api.PersistentVolume to []dataselect.DataCell.
func toCells(std []v1.PersistentVolume) []dataselect.DataCell {
	cells := make([]dataselect.DataCell, len(std))
	for i := range std {
		cells[i] = PersistentVolumeCell(std[i])
	}
	return cells
}

// fromCells converts cells []dataselect.DataCell to []api.PersistentVolume.
func fromCells(cells []dataselect.DataCell) []v1.PersistentVolume {
	std := make([]v1.PersistentVolume, len(cells))
	for i := range std {
		std[i] = v1.PersistentVolume(cells[i].(PersistentVolumeCell))
	}
	return std
}
