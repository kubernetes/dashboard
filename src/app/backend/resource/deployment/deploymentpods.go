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
	"github.com/kubernetes/dashboard/src/app/backend/client"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/pod"

	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"k8s.io/kubernetes/pkg/apis/extensions"
	"k8s.io/kubernetes/pkg/api"
)

// getJobPods returns list of pods targeting deployment.
func getDeploymentPods(deployment *extensions.Deployment, pods []api.Pod, heapsterClient client.HeapsterClient, dsQuery *dataselect.DataSelectQuery) *pod.PodList {
	pods = common.FilterNamespacedPodsBySelector(pods, deployment.ObjectMeta.Namespace,
		deployment.Spec.Selector.MatchLabels)

	podList := pod.CreatePodList(pods, dsQuery, heapsterClient)
	return &podList
}
