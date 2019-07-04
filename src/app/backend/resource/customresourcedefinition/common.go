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

package customresourcedefinition

import (
	"strings"

	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	apiextensions "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1beta1"
	"k8s.io/apimachinery/pkg/runtime/schema"
)

type CustomResourceDefinitionCell apiextensions.CustomResourceDefinition

func (self CustomResourceDefinitionCell) GetProperty(name dataselect.PropertyName) dataselect.ComparableValue {
	switch name {
	case dataselect.NameProperty:
		return dataselect.StdComparableString(self.ObjectMeta.Name)
	case dataselect.CreationTimestampProperty:
		return dataselect.StdComparableTime(self.ObjectMeta.CreationTimestamp.Time)
	default:
		// if name is not supported then just return a constant dummy value, sort will have no effect.
		return nil
	}
}

func toCells(std []apiextensions.CustomResourceDefinition) []dataselect.DataCell {
	cells := make([]dataselect.DataCell, len(std))
	for i := range std {
		cells[i] = CustomResourceDefinitionCell(std[i])
	}

	return cells
}

func fromCells(cells []dataselect.DataCell) []apiextensions.CustomResourceDefinition {
	std := make([]apiextensions.CustomResourceDefinition, len(cells))
	for i := range std {
		std[i] = apiextensions.CustomResourceDefinition(cells[i].(CustomResourceDefinitionCell))
	}

	return std
}

// The code below allows to perform complex data section on ThirdPartyResourceObject.
type CustomResourceObjectCell CustomResourceObject

func (self CustomResourceObjectCell) GetProperty(name dataselect.PropertyName) dataselect.ComparableValue {
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

func toObjectCells(std []CustomResourceObject) []dataselect.DataCell {
	cells := make([]dataselect.DataCell, len(std))
	for i := range std {
		cells[i] = CustomResourceObjectCell(std[i])
	}
	return cells
}

func fromObjectCells(cells []dataselect.DataCell) []CustomResourceObject {
	std := make([]CustomResourceObject, len(cells))
	for i := range std {
		std[i] = CustomResourceObject(cells[i].(CustomResourceObjectCell))
	}
	return std
}

// getCustomResourceDefinitionGroupVersion returns first group version of custom resource definition.
// It's also known as preferredVersion.
func getCustomResourceDefinitionGroupVersion(crd *apiextensions.CustomResourceDefinition) schema.GroupVersion {
	version := crd.Spec.Version
	group := ""
	if strings.Contains(crd.ObjectMeta.Name, ".") {
		group = crd.ObjectMeta.Name[strings.Index(crd.ObjectMeta.Name, ".")+1:]
	} else {
		group = crd.ObjectMeta.Name
	}

	return schema.GroupVersion{
		Group:   group,
		Version: version,
	}
}
