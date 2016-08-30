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

package petset

import (

	"k8s.io/kubernetes/pkg/apis/apps"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/metric"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
)

// The code below allows to perform complex data section on []apps.PetSet

type PetSetCell apps.PetSet

func (self PetSetCell) GetProperty(name dataselect.PropertyName) dataselect.ComparableValue {
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

func (self PetSetCell) GetResourceSelector() *metric.ResourceSelector {
	return &metric.ResourceSelector{
		Namespace:          self.ObjectMeta.Namespace,
		ResourceType:       common.ResourceKindPetSet,
		ResourceName:       self.ObjectMeta.Name,
		Selector:           self.Spec.Selector.MatchLabels,
	}
}

func toCells(std []apps.PetSet) []dataselect.DataCell {
	cells := make([]dataselect.DataCell, len(std))
	for i := range std {
		cells[i] = PetSetCell(std[i])
	}
	return cells
}

func fromCells(cells []dataselect.DataCell) []apps.PetSet {
	std := make([]apps.PetSet, len(cells))
	for i := range std {
		std[i] = apps.PetSet(cells[i].(PetSetCell))
	}
	return std
}