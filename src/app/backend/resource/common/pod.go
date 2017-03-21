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

package common

import (
	"k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/types"
	api "k8s.io/client-go/pkg/api/v1"
)

// FilterNamespacedPodsBySelector returns pods targeted by given resource label selector in given
// namespace.
func FilterNamespacedPodsBySelector(pods []api.Pod, namespace string,
	resourceSelector map[string]string) []api.Pod {

	var matchingPods []api.Pod
	for _, pod := range pods {
		if pod.ObjectMeta.Namespace == namespace &&
			IsSelectorMatching(resourceSelector, pod.Labels) {
			matchingPods = append(matchingPods, pod)
		}
	}

	return matchingPods
}

// FilterPodsByControllerResource returns set of pods controlled by given resource.
// Please note, that OwnerReference is still in development phase:
// https://github.com/kubernetes/community/blob/master/contributors/design-proposals/controller-ref.md.
// Currently works for given resources: Replication Controllers.
func FilterPodsByControllerResource(resourceNamespace string, resourceUID types.UID, allPods []api.Pod) []api.Pod {
	var pods []api.Pod
	for _, pod := range allPods {
		if pod.Namespace == resourceNamespace {
			for _, ownerRef := range pod.OwnerReferences {
				if *ownerRef.Controller == true && ownerRef.UID == resourceUID {
					pods = append(pods, pod)
				}
			}
		}
	}
	return pods
}

// FilterPodsBySelector returns pods targeted by given resource selector.
func FilterPodsBySelector(pods []api.Pod, resourceSelector map[string]string) []api.Pod {

	var matchingPods []api.Pod
	for _, pod := range pods {
		if IsSelectorMatching(resourceSelector, pod.Labels) {
			matchingPods = append(matchingPods, pod)
		}
	}
	return matchingPods
}

// FilterNamespacedPodsByLabelSelector returns pods targeted by given resource label selector in
// given namespace.
func FilterNamespacedPodsByLabelSelector(pods []api.Pod, namespace string,
	labelSelector *v1.LabelSelector) []api.Pod {

	var matchingPods []api.Pod
	for _, pod := range pods {
		if pod.ObjectMeta.Namespace == namespace &&
			IsLabelSelectorMatching(pod.Labels, labelSelector) {
			matchingPods = append(matchingPods, pod)
		}
	}
	return matchingPods
}

// FilterPodsByLabelSelector returns pods targeted by given resource label selector.
func FilterPodsByLabelSelector(pods []api.Pod, labelSelector *v1.LabelSelector) []api.Pod {

	var matchingPods []api.Pod
	for _, pod := range pods {
		if IsLabelSelectorMatching(pod.Labels, labelSelector) {
			matchingPods = append(matchingPods, pod)
		}
	}
	return matchingPods
}

// GetContainerImages returns container image strings from the given pod spec.
func GetContainerImages(podTemplate *api.PodSpec) []string {
	var containerImages []string
	for _, container := range podTemplate.Containers {
		containerImages = append(containerImages, container.Image)
	}
	return containerImages
}
