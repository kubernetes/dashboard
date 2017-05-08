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
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"k8s.io/client-go/pkg/api/v1"
)

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
