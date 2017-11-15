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

package storageclass

import (
	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/persistentvolume"
	storage "k8s.io/api/storage/v1"
)

func toStorageClass(storageClass *storage.StorageClass) StorageClass {
	return StorageClass{
		ObjectMeta:  api.NewObjectMeta(storageClass.ObjectMeta),
		TypeMeta:    api.NewTypeMeta(api.ResourceKindStorageClass),
		Provisioner: storageClass.Provisioner,
		Parameters:  storageClass.Parameters,
	}
}

func toStorageClassDetail(storageClass *storage.StorageClass,
	persistentVolumeList *persistentvolume.PersistentVolumeList) StorageClassDetail {
	return StorageClassDetail{
		ObjectMeta:           api.NewObjectMeta(storageClass.ObjectMeta),
		TypeMeta:             api.NewTypeMeta(api.ResourceKindStorageClass),
		Provisioner:          storageClass.Provisioner,
		Parameters:           storageClass.Parameters,
		PersistentVolumeList: *persistentVolumeList,
	}
}

// The code below allows to perform complex data section on []storage.StorageClass

type StorageClassCell storage.StorageClass

func (self StorageClassCell) GetProperty(name dataselect.PropertyName) dataselect.ComparableValue {
	switch name {
	case dataselect.NameProperty:
		return dataselect.StdComparableString(self.ObjectMeta.Name)
	case dataselect.CreationTimestampProperty:
		return dataselect.StdComparableTime(self.ObjectMeta.CreationTimestamp.Time)
	case dataselect.NamespaceProperty:
		return dataselect.StdComparableString(self.ObjectMeta.Namespace)
	default:
		// if name is not supported then just return a constant dummy value, sort will have no effect.
		return nil
	}
}

func toCells(std []storage.StorageClass) []dataselect.DataCell {
	cells := make([]dataselect.DataCell, len(std))
	for i := range std {
		cells[i] = StorageClassCell(std[i])
	}
	return cells
}

func fromCells(cells []dataselect.DataCell) []storage.StorageClass {
	std := make([]storage.StorageClass, len(cells))
	for i := range std {
		std[i] = storage.StorageClass(cells[i].(StorageClassCell))
	}
	return std
}
