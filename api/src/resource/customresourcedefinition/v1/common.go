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

package v1

import (
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/customresourcedefinition/types"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	api "k8s.io/api/core/v1"
	apiextensions "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1"
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

// The code below allows to perform complex data section on CustomResourceObject.
type CustomResourceObjectCell types.CustomResourceObject

func (self CustomResourceObjectCell) GetProperty(name dataselect.PropertyName) dataselect.ComparableValue {
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

func toObjectCells(std []types.CustomResourceObject) []dataselect.DataCell {
	cells := make([]dataselect.DataCell, len(std))
	for i := range std {
		cells[i] = CustomResourceObjectCell(std[i])
	}
	return cells
}

func fromObjectCells(cells []dataselect.DataCell) []types.CustomResourceObject {
	std := make([]types.CustomResourceObject, len(cells))
	for i := range std {
		std[i] = types.CustomResourceObject(cells[i].(CustomResourceObjectCell))
	}
	return std
}

// getCustomResourceDefinitionGroupVersion returns first group version of custom resource definition.
// It's also known as preferredVersion.
func getCustomResourceDefinitionGroupVersion(crd *apiextensions.CustomResourceDefinition) schema.GroupVersion {
	return schema.GroupVersion{
		Group:   crd.Spec.Group,
		Version: crd.Spec.Versions[0].Name,
	}
}

func getCRDConditions(crd *apiextensions.CustomResourceDefinition) []common.Condition {
	var conditions []common.Condition
	for _, condition := range crd.Status.Conditions {
		conditions = append(conditions, common.Condition{
			Type:               string(condition.Type),
			Status:             api.ConditionStatus(condition.Status),
			LastTransitionTime: condition.LastTransitionTime,
			Reason:             condition.Reason,
			Message:            condition.Message,
		})
	}
	return conditions
}

func isServed(crd apiextensions.CustomResourceDefinition) bool {
	for _, version := range crd.Spec.Versions {
		if version.Served {
			return true
		}
	}

	return false
}

func removeNonServedVersions(crd apiextensions.CustomResourceDefinition) apiextensions.CustomResourceDefinition {
	versions := make([]apiextensions.CustomResourceDefinitionVersion, 0)

	for _, version := range crd.Spec.Versions {
		if version.Served {
			versions = append(versions, version)
		}
	}

	crd.Spec.Versions = versions
	return crd
}
