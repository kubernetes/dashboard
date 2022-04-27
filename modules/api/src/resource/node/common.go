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

package node

import (
	"github.com/kubernetes/dashboard/src/app/backend/api"
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	v1 "k8s.io/api/core/v1"
)

//getContainerImages returns container image strings from the given node.
func getContainerImages(node v1.Node) []string {
	var containerImages []string
	for _, image := range node.Status.Images {
		for _, name := range image.Names {
			containerImages = append(containerImages, name)
		}
	}
	return containerImages
}

// The code below allows to perform complex data section on []api.Node

type NodeCell v1.Node

func (self NodeCell) GetProperty(name dataselect.PropertyName) dataselect.ComparableValue {
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

func (self NodeCell) GetResourceSelector() *metricapi.ResourceSelector {
	return &metricapi.ResourceSelector{
		Namespace:    self.ObjectMeta.Namespace,
		ResourceType: api.ResourceKindNode,
		ResourceName: self.ObjectMeta.Name,
		UID:          self.ObjectMeta.UID,
	}
}

func toCells(std []v1.Node) []dataselect.DataCell {
	cells := make([]dataselect.DataCell, len(std))
	for i := range std {
		cells[i] = NodeCell(std[i])
	}
	return cells
}

func fromCells(cells []dataselect.DataCell) []v1.Node {
	std := make([]v1.Node, len(cells))
	for i := range std {
		std[i] = v1.Node(cells[i].(NodeCell))
	}
	return std
}

func getNodeConditions(node v1.Node) []common.Condition {
	var conditions []common.Condition
	for _, condition := range node.Status.Conditions {
		conditions = append(conditions, common.Condition{
			Type:               string(condition.Type),
			Status:             condition.Status,
			LastProbeTime:      condition.LastHeartbeatTime,
			LastTransitionTime: condition.LastTransitionTime,
			Reason:             condition.Reason,
			Message:            condition.Message,
		})
	}
	return conditions
}
