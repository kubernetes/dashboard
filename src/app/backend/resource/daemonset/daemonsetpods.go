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

package daemonset

import (
	"log"
	"sort"

	"github.com/kubernetes/dashboard/resource/replicationcontroller"
	api "k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/api/unversioned"
	client "k8s.io/kubernetes/pkg/client/unversioned"
)

// TotalRestartCountSorter sorts DaemonSetPodWithContainers by restarts number.
type TotalRestartCountSorterforDS []DaemonSetPodWithContainers

func (a TotalRestartCountSorterforDS) Len() int      { return len(a) }
func (a TotalRestartCountSorterforDS) Swap(i, j int) { a[i], a[j] = a[j], a[i] }
func (a TotalRestartCountSorterforDS) Less(i, j int) bool {
	return a[i].TotalRestartCount > a[j].TotalRestartCount
}

// List of pods that belongs to a Daemon Set.
type DaemonSetPods struct {
	// List of pods that belongs to a Daemon Set.
	Pods []DaemonSetPodWithContainers `json:"pods"`
}

// Detailed information about a Pod that belongs to a Daemon Set.
type DaemonSetPodWithContainers struct {
	// Name of the Pod.
	Name string `json:"name"`

	// Time the Pod has started. Empty if not started.
	StartTime *unversioned.Time `json:"startTime"`

	// Total number of restarts.
	TotalRestartCount int `json:"totalRestartCount"`

	// List of Containers that belongs to particular Pod.
	PodContainers []replicationcontroller.PodContainer `json:"podContainers"`
}

// Returns list of pods with containers for the given daemon set in the given namespace.
// Limit specify the number of records to return. There is no limit when given value is zero.
func GetDaemonSetPods(client *client.Client, namespace, name string, limit int) (
	*DaemonSetPods, error) {
	log.Printf("Getting list of pods from %s daemon set in %s namespace with limit %d", name,
		namespace, limit)

	pods, err := getRawDaemonSetPods(client, namespace, name)
	if err != nil {
		return nil, err
	}

	return getDaemonSetPods(pods.Items, limit), nil
}

// Creates and return structure containing pods with containers for given daemon set.
// Data is sorted by total number of restarts for daemon set pod.
// Result set can be limited
func getDaemonSetPods(pods []api.Pod, limit int) *DaemonSetPods {
	daemonSetPods := &DaemonSetPods{
		Pods: make([]DaemonSetPodWithContainers, 0),
	}
	for _, pod := range pods {
		totalRestartCount := 0
		daemonSetPodWithContainers := DaemonSetPodWithContainers{
			Name:          pod.Name,
			StartTime:     pod.Status.StartTime,
			PodContainers: make([]PodContainer, 0),
		}

		podContainersByName := make(map[string]*PodContainer)

		for _, container := range pod.Spec.Containers {
			podContainer := PodContainer{Name: container.Name}
			daemonSetPodWithContainers.PodContainers =
				append(daemonSetPodWithContainers.PodContainers, podContainer)

			podContainersByName[container.Name] = &(daemonSetPodWithContainers.
				PodContainers[len(daemonSetPodWithContainers.PodContainers)-1])
		}

		for _, containerStatus := range pod.Status.ContainerStatuses {
			podContainer, ok := podContainersByName[containerStatus.Name]
			if ok {
				podContainer.RestartCount = containerStatus.RestartCount
				totalRestartCount += containerStatus.RestartCount
			}
		}
		daemonSetPodWithContainers.TotalRestartCount = totalRestartCount
		daemonSetPods.Pods = append(daemonSetPods.Pods, daemonSetPodWithContainers)
	}
	sort.Sort(TotalRestartCountSorterforDS(daemonSetPods.Pods))

	if limit > 0 {
		if limit > len(daemonSetPods.Pods) {
			limit = len(daemonSetPods.Pods)
		}
		daemonSetPods.Pods = daemonSetPods.Pods[0:limit]
	}

	return daemonSetPods
}
