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

package deployment

import (
	"github.com/kubernetes/dashboard/src/app/backend/api"
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	apps "k8s.io/api/apps/v1beta2"
)

// The code below allows to perform complex data section on Deployment

type DeploymentCell apps.Deployment

func (self DeploymentCell) GetProperty(name dataselect.PropertyName) dataselect.ComparableValue {
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

func (self DeploymentCell) GetResourceSelector() *metricapi.ResourceSelector {
	return &metricapi.ResourceSelector{
		Namespace:    self.ObjectMeta.Namespace,
		ResourceType: api.ResourceKindDeployment,
		ResourceName: self.ObjectMeta.Name,
		Selector:     self.Spec.Selector.MatchLabels,
		UID:          self.UID,
	}
}

func toCells(std []apps.Deployment) []dataselect.DataCell {
	cells := make([]dataselect.DataCell, len(std))
	for i := range std {
		cells[i] = DeploymentCell(std[i])
	}
	return cells
}

func fromCells(cells []dataselect.DataCell) []apps.Deployment {
	std := make([]apps.Deployment, len(cells))
	for i := range std {
		std[i] = apps.Deployment(cells[i].(DeploymentCell))
	}
	return std
}
