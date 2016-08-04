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
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"

	"k8s.io/kubernetes/pkg/apis/apps"
)

// The code below allows to perform complex data section on []apps.PetSet

var propertyGetters = map[string]func(PetSetCell)(common.ComparableValue){
	"name": func(self PetSetCell)(common.ComparableValue) {return common.StdComparableString(self.ObjectMeta.Name)},
	"creationTimestamp": func(self PetSetCell)(common.ComparableValue) {return common.StdComparableTime(self.ObjectMeta.CreationTimestamp.Time)},
	"namespace": func(self PetSetCell)(common.ComparableValue) {return common.StdComparableString(self.ObjectMeta.Namespace)},
}


type PetSetCell apps.PetSet

func (self PetSetCell) GetProperty(name string) common.ComparableValue {
	getter, isGetterPresent := propertyGetters[name]
	if !isGetterPresent {
		// if getter not present then just return a constant dummy value, sort will have no effect.
		return common.StdComparableInt(0)
	}
	return getter(self)
}


func toCells(std []apps.PetSet) []common.GenericDataCell {
	cells := make([]common.GenericDataCell, len(std))
	for i := range std {
		cells[i] = PetSetCell(std[i])
	}
	return cells
}

func fromCells(cells []common.GenericDataCell) []apps.PetSet {
	std := make([]apps.PetSet, len(cells))
	for i := range std {
		std[i] = apps.PetSet(cells[i].(PetSetCell))
	}
	return std
}