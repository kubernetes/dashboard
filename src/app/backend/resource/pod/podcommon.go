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

package pod

import (
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"k8s.io/kubernetes/pkg/api"
)

// Gets restart count of given pod (total number of its containers restarts).
func getRestartCount(pod api.Pod) int32 {
	var restartCount int32 = 0
	for _, containerStatus := range pod.Status.ContainerStatuses {
		restartCount += containerStatus.RestartCount
	}
	return restartCount
}

// ToPod transforms Kubernetes pod object into object returned by API.
func ToPod(pod *api.Pod, metrics *common.MetricsByPod) Pod {
	podDetail := Pod{
		ObjectMeta:   common.NewObjectMeta(pod.ObjectMeta),
		TypeMeta:     common.NewTypeMeta(common.ResourceKindPod),
		PodPhase:     pod.Status.Phase,
		PodIP:        pod.Status.PodIP,
		RestartCount: getRestartCount(*pod),
	}

	if metrics != nil && metrics.MetricsMap[pod.Namespace] != nil {
		metric := metrics.MetricsMap[pod.Namespace][pod.Name]
		podDetail.Metrics = &metric
	}

	return podDetail
}

// GetContainerImages returns container image strings from the given pod spec.
func GetContainerImages(podTemplate *api.PodSpec) []string {
	var containerImages []string
	for _, container := range podTemplate.Containers {
		containerImages = append(containerImages, container.Image)
	}
	return containerImages
}

// The code below allows to perform complex data section on []api.Pod

type PodCell api.Pod

func (self PodCell) GetProperty(name common.PropertyName) common.ComparableValue {
	switch name {
	case common.NameProperty:
		return common.StdComparableString(self.ObjectMeta.Name)
	case common.CreationTimestampProperty:
		return common.StdComparableTime(self.ObjectMeta.CreationTimestamp.Time)
	case common.NamespaceProperty:
		return common.StdComparableString(self.ObjectMeta.Namespace)
	default:
		// if name is not supported then just return a constant dummy value, sort will have no effect.
		return nil
	}
}


func toCells(std []api.Pod) []common.GenericDataCell {
	cells := make([]common.GenericDataCell, len(std))
	for i := range std {
		cells[i] = PodCell(std[i])
	}
	return cells
}

func fromCells(cells []common.GenericDataCell) []api.Pod {
	std := make([]api.Pod, len(cells))
	for i := range std {
		std[i] = api.Pod(cells[i].(PodCell))
	}
	return std
}
