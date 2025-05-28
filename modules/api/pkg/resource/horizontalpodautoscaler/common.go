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

package horizontalpodautoscaler

import (
	autoscaling "k8s.io/api/autoscaling/v1"
	"k8s.io/dashboard/api/pkg/resource/dataselect"
)

// ScaleTargetRef is a simple mapping of an autoscaling.CrossVersionObjectReference
type ScaleTargetRef struct {
	Kind string `json:"kind"`
	Name string `json:"name"`
}

// The code below allows to perform complex data section on []autoscaling.HorizontalPodAutoscaler

type HorizontalPodAutoscalerCell autoscaling.HorizontalPodAutoscaler

func (in HorizontalPodAutoscalerCell) GetProperty(name dataselect.PropertyName) dataselect.ComparableValue {
	switch name {
	case dataselect.NameProperty:
		return dataselect.StdComparableString(in.Name)
	case dataselect.CreationTimestampProperty:
		return dataselect.StdComparableTime(in.CreationTimestamp.Time)
	case dataselect.NamespaceProperty:
		return dataselect.StdComparableString(in.Namespace)
	default:
		// if name is not supported then just return a constant dummy value, sort will have no effect.
		return nil
	}
}

func toCells(std []autoscaling.HorizontalPodAutoscaler) []dataselect.DataCell {
	cells := make([]dataselect.DataCell, len(std))
	for i := range std {
		cells[i] = HorizontalPodAutoscalerCell(std[i])
	}
	return cells
}

func fromCells(cells []dataselect.DataCell) []autoscaling.HorizontalPodAutoscaler {
	std := make([]autoscaling.HorizontalPodAutoscaler, len(cells))
	for i := range std {
		std[i] = autoscaling.HorizontalPodAutoscaler(cells[i].(HorizontalPodAutoscalerCell))
	}
	return std
}
