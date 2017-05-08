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

package thirdpartyresource

import (
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	extensions "k8s.io/client-go/pkg/apis/extensions/v1beta1"
)

// The code below allows to perform complex data section on []extensions.ThirdPartyResource.
type ThirdPartyResourceCell extensions.ThirdPartyResource

func (self ThirdPartyResourceCell) GetProperty(name dataselect.PropertyName) dataselect.ComparableValue {
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

func toCells(std []extensions.ThirdPartyResource) []dataselect.DataCell {
	cells := make([]dataselect.DataCell, len(std))
	for i := range std {
		cells[i] = ThirdPartyResourceCell(std[i])
	}
	return cells
}

func fromCells(cells []dataselect.DataCell) []extensions.ThirdPartyResource {
	std := make([]extensions.ThirdPartyResource, len(cells))
	for i := range std {
		std[i] = extensions.ThirdPartyResource(cells[i].(ThirdPartyResourceCell))
	}
	return std
}

// The code below allows to perform complex data section on ThirdPartyResourceObject.
type ThirdPartyResourceObjectCell ThirdPartyResourceObject

func (self ThirdPartyResourceObjectCell) GetProperty(name dataselect.PropertyName) dataselect.ComparableValue {
	switch name {
	case dataselect.NameProperty:
		return dataselect.StdComparableString(self.Metadata.Name)
	case dataselect.CreationTimestampProperty:
		return dataselect.StdComparableTime(self.Metadata.CreationTimestamp.Time)
	case dataselect.NamespaceProperty:
		return dataselect.StdComparableString(self.Metadata.Namespace)
	default:
		// if name is not supported then just return a constant dummy value, sort will have no effect.
		return nil
	}
}

func toObjectCells(std []ThirdPartyResourceObject) []dataselect.DataCell {
	cells := make([]dataselect.DataCell, len(std))
	for i := range std {
		cells[i] = ThirdPartyResourceObjectCell(std[i])
	}
	return cells
}

func fromObjectCells(cells []dataselect.DataCell) []ThirdPartyResourceObject {
	std := make([]ThirdPartyResourceObject, len(cells))
	for i := range std {
		std[i] = ThirdPartyResourceObject(cells[i].(ThirdPartyResourceObjectCell))
	}
	return std
}
