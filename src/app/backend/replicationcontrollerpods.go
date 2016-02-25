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

package main

import (
	"log"
	"sort"

	api "k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/api/unversioned"
	client "k8s.io/kubernetes/pkg/client/unversioned"
)

// TotalRestartCountSorter sorts ReplicationControllerPodWithContainers by restarts number.
type TotalRestartCountSorter []ReplicationControllerPodWithContainers

func (a TotalRestartCountSorter) Len() int      { return len(a) }
func (a TotalRestartCountSorter) Swap(i, j int) { a[i], a[j] = a[j], a[i] }
func (a TotalRestartCountSorter) Less(i, j int) bool {
	return a[i].TotalRestartCount > a[j].TotalRestartCount
}

// Information about a Container that belongs to a Pod.
type PodContainer struct {
	// Name of a Container.
	Name string `json:"name"`

	// Number of restarts.
	RestartCount int `json:"restartCount"`
}

// List of pods that belongs to a Replication Controller.
type ReplicationControllerPods struct {
	// List of pods that belongs to a Replication Controller.
	Pods []ReplicationControllerPodWithContainers `json:"pods"`
}

// Detailed information about a Pod that belongs to a Replication Controller.
type ReplicationControllerPodWithContainers struct {
	// Name of the Pod.
	Name string `json:"name"`

	// Time the Pod has started. Empty if not started.
	StartTime *unversioned.Time `json:"startTime"`

	// Total number of restarts.
	TotalRestartCount int `json:"totalRestartCount"`

	// List of Containers that belongs to particular Pod.
	PodContainers []PodContainer `json:"podContainers"`
}

// Returns list of pods with containers for the given replication controller in the given namespace.
// Limit specify the number of records to return. There is no limit when given value is zero.
func GetReplicationControllerPods(client *client.Client, namespace, name string, limit int) (
	*ReplicationControllerPods, error) {
	log.Printf("Getting list of pods from %s replication controller in %s namespace with limit %d", name,
		namespace, limit)

	pods, err := getRawReplicationControllerPods(client, namespace, name)
	if err != nil {
		return nil, err
	}

	return getReplicationControllerPods(pods.Items, limit), nil
}

// Creates and return structure containing pods with containers for given replication controller.
// Data is sorted by total number of restarts for replication controller pod.
// Result set can be limited
func getReplicationControllerPods(pods []api.Pod, limit int) *ReplicationControllerPods {
	replicationControllerPods := &ReplicationControllerPods{
		Pods: make([]ReplicationControllerPodWithContainers, 0),
	}
	for _, pod := range pods {
		totalRestartCount := 0
		replicationControllerPodWithContainers := ReplicationControllerPodWithContainers{
			Name:          pod.Name,
			StartTime:     pod.Status.StartTime,
			PodContainers: make([]PodContainer, 0),
		}

		podContainersByName := make(map[string]*PodContainer)

		for _, container := range pod.Spec.Containers {
			podContainer := PodContainer{Name: container.Name}
			replicationControllerPodWithContainers.PodContainers =
				append(replicationControllerPodWithContainers.PodContainers, podContainer)

			podContainersByName[container.Name] = &(replicationControllerPodWithContainers.
				PodContainers[len(replicationControllerPodWithContainers.PodContainers)-1])
		}

		for _, containerStatus := range pod.Status.ContainerStatuses {
			podContainer, ok := podContainersByName[containerStatus.Name]
			if ok {
				podContainer.RestartCount = containerStatus.RestartCount
				totalRestartCount += containerStatus.RestartCount
			}
		}
		replicationControllerPodWithContainers.TotalRestartCount = totalRestartCount
		replicationControllerPods.Pods = append(replicationControllerPods.Pods, replicationControllerPodWithContainers)
	}
	sort.Sort(TotalRestartCountSorter(replicationControllerPods.Pods))

	if limit > 0 {
		if limit > len(replicationControllerPods.Pods) {
			limit = len(replicationControllerPods.Pods)
		}
		replicationControllerPods.Pods = replicationControllerPods.Pods[0:limit]
	}

	return replicationControllerPods
}
