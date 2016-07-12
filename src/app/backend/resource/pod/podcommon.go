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

func ToPod(pod *api.Pod, metrics *MetricsByPod) Pod {
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

func ToPodDetail(pod *api.Pod, metrics *MetricsByPod) PodDetail {
	podDetail := PodDetail{
		ObjectMeta:      common.NewObjectMeta(pod.ObjectMeta),
		TypeMeta:        common.NewTypeMeta(common.ResourceKindPod),
		PodPhase:        pod.Status.Phase,
		PodIP:           pod.Status.PodIP,
		RestartCount:    getRestartCount(*pod),
		ContainerImages: GetContainerImages(&pod.Spec),
		NodeName:        pod.Spec.NodeName,
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

func paginate(pods []api.Pod, pQuery *common.PaginationQuery) []api.Pod {
	startIndex, endIndex := pQuery.GetPaginationSettings(len(pods))

	// Return all items if provided settings do not meet requirements
	if !pQuery.CanPaginate(len(pods), startIndex) {
		return pods
	}

	return pods[startIndex:endIndex]
}
