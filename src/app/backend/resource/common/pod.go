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
	"k8s.io/client-go/pkg/api/helper"
	api "k8s.io/client-go/pkg/api/v1"
	extensions "k8s.io/client-go/pkg/apis/extensions/v1beta1"
)

// FilterPodsByControllerResource returns a subset of pods controlled by given deployment.
func FilterDeploymentPodsByOwnerReference(deployment extensions.Deployment,
	allRS []extensions.ReplicaSet, allPods []api.Pod) []api.Pod {
	var matchingPods []api.Pod

	rsTemplate := api.PodTemplateSpec{
		ObjectMeta: deployment.Spec.Template.ObjectMeta,
		Spec:       deployment.Spec.Template.Spec,
	}

	for _, rs := range allRS {
		if EqualIgnoreHash(rs.Spec.Template, rsTemplate) {
			matchingPods = FilterPodsByOwnerReference(rs.Namespace, rs.UID, allPods)
		}
	}

	return matchingPods
}

// FilterPodsByControllerResource returns a subset of pods controlled by given controller resource,
// excluding deployments.
func FilterPodsByOwnerReference(namespace string, uid types.UID, allPods []api.Pod) []api.Pod {
	var matchingPods []api.Pod
	for _, pod := range allPods {
		if pod.Namespace == namespace {
			for _, ownerRef := range pod.OwnerReferences {
				if ownerRef.Controller != nil && *ownerRef.Controller == true &&
					ownerRef.UID == uid {
					matchingPods = append(matchingPods, pod)
				}
			}
		}
	}
	return matchingPods
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

// GetContainerImages returns container image strings from the given pod spec.
func GetContainerImages(podTemplate *api.PodSpec) []string {
	var containerImages []string
	for _, container := range podTemplate.Containers {
		containerImages = append(containerImages, container.Image)
	}
	return containerImages
}

// EqualIgnoreHash returns true if two given podTemplateSpec are equal, ignoring the diff in value of Labels[pod-template-hash]
// We ignore pod-template-hash because the hash result would be different upon podTemplateSpec API changes
// (e.g. the addition of a new field will cause the hash code to change)
// Note that we assume input podTemplateSpecs contain non-empty labels
func EqualIgnoreHash(template1, template2 api.PodTemplateSpec) bool {
	// First, compare template.Labels (ignoring hash)
	labels1, labels2 := template1.Labels, template2.Labels
	if len(labels1) > len(labels2) {
		labels1, labels2 = labels2, labels1
	}
	// We make sure len(labels2) >= len(labels1)
	for k, v := range labels2 {
		if labels1[k] != v && k != extensions.DefaultDeploymentUniqueLabelKey {
			return false
		}
	}
	// Then, compare the templates without comparing their labels
	template1.Labels, template2.Labels = nil, nil
	return helper.Semantic.DeepEqual(template1, template2)
}
