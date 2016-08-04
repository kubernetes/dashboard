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

package configmap

import (
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"k8s.io/kubernetes/pkg/api"
)

// The code below allows to perform complex data section on []api.ConfigMap

var propertyGetters = map[string]func(ConfigMapCell)(common.ComparableValue){
	"name": func(self ConfigMapCell)(common.ComparableValue) {return common.StdComparableString(self.ObjectMeta.Name)},
	"creationTimestamp": func(self ConfigMapCell)(common.ComparableValue) {return common.StdComparableTime(self.ObjectMeta.CreationTimestamp.Time)},
	"namespace": func(self ConfigMapCell)(common.ComparableValue) {return common.StdComparableString(self.ObjectMeta.Namespace)},
}


type ConfigMapCell api.ConfigMap

func (self ConfigMapCell) GetProperty(name string) common.ComparableValue {
	getter, isGetterPresent := propertyGetters[name]
	if !isGetterPresent {
		// if getter not present then just return a constant dummy value, sort will have no effect.
		return common.StdComparableInt(0)
	}
	return getter(self)
}


func toCells(std []api.ConfigMap) []common.GenericDataCell {
	cells := make([]common.GenericDataCell, len(std))
	for i := range std {
		cells[i] = ConfigMapCell(std[i])
	}
	return cells
}

func fromCells(cells []common.GenericDataCell) []api.ConfigMap {
	std := make([]api.ConfigMap, len(cells))
	for i := range std {
		std[i] = api.ConfigMap(cells[i].(ConfigMapCell))
	}
	return std
}
