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

package service

import (
	v1 "k8s.io/api/core/v1"
	"k8s.io/dashboard/api/pkg/resource/dataselect"
)

// The code below allows to perform complex data section on []api.Service

type ServiceCell v1.Service

func (in ServiceCell) GetProperty(name dataselect.PropertyName) dataselect.ComparableValue {
	switch name {
	case dataselect.NameProperty:
		return dataselect.StdComparableString(in.Name)
	case dataselect.CreationTimestampProperty:
		return dataselect.StdComparableTime(in.CreationTimestamp.Time)
	case dataselect.NamespaceProperty:
		return dataselect.StdComparableString(in.Namespace)
	case dataselect.TypeProperty:
		return dataselect.StdComparableString(in.Spec.Type)
	default:
		// if name is not supported then just return a constant dummy value, sort will have no effect.
		return nil
	}
}

func toCells(std []v1.Service) []dataselect.DataCell {
	cells := make([]dataselect.DataCell, len(std))
	for i := range std {
		cells[i] = ServiceCell(std[i])
	}
	return cells
}

func fromCells(cells []dataselect.DataCell) []v1.Service {
	std := make([]v1.Service, len(cells))
	for i := range std {
		std[i] = v1.Service(cells[i].(ServiceCell))
	}
	return std
}
