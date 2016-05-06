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

package deployment

import (
	"github.com/kubernetes/dashboard/resource/common"
	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/api/unversioned"
	"k8s.io/kubernetes/pkg/apis/extensions"
	"k8s.io/kubernetes/pkg/labels"
)

// getMatchingPods returns pods matching the given selector and namespace
func getMatchingPods(labelSelector *unversioned.LabelSelector, namespace string,
	pods []api.Pod) []api.Pod {

	selector, _ := unversioned.LabelSelectorAsSelector(labelSelector)

	var matchingPods []api.Pod
	for _, pod := range pods {
		if pod.ObjectMeta.Namespace == namespace &&
			selector.Matches(labels.Set(pod.ObjectMeta.Labels)) {
			matchingPods = append(matchingPods, pod)
		}
	}
	return matchingPods
}

// getPodInfo returns aggregate information about replica set pods.
func getPodInfo(resource *extensions.Deployment,
	pods []api.Pod) common.ControllerPodInfo {

	return common.GetPodInfo(resource.Status.Replicas, resource.Spec.Replicas, pods)
}
