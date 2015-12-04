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
	api "k8s.io/kubernetes/pkg/api"
	types "k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/api/unversioned"
	client "k8s.io/kubernetes/pkg/client/unversioned"
)

// Information about a Container that belongs to a Pod.
type PodContainer struct {
	// Name of a Container.
	Name string `json:"name"`

	// Container state.
	State types.ContainerState `json:"state,omitempty"`

	// Number of restarts.
	RestartCount int `json:"restartCount"`
}

// List of pods that belongs to a Replica Set.
type ReplicaSetPods struct {
	// List of pods that belongs to a Replica Set.
	Pods []ReplicaSetPodWithContainers `json:"pods"`
}

// Detailed information about a Pod that belongs to a Replica Set.
type ReplicaSetPodWithContainers struct {
	// Name of the Pod.
	Name string `json:"name"`

	// Time the Pod has started. Empty if not started.
	StartTime *unversioned.Time `json:"startTime"`

	// List of Containers that belongs to particular Pod.
	PodContainers []PodContainer `json:"podContainers"`
}

// Returns list of pods with containers for the given replica set in the given namespace.
func GetReplicaSetPods(client *client.Client, namespace string, name string) (
	*ReplicaSetPods, error) {
	pods, err := getRawReplicaSetPods(client, namespace, name)
	if err != nil {
		return nil, err
	}

	return getReplicaSetPods(pods.Items), nil
}

// Creates and return structure containing pods with containers for given replica set.
func getReplicaSetPods(pods []api.Pod) *ReplicaSetPods {
	replicaSetPods := &ReplicaSetPods{}

	for _, pod := range pods {
		replicaSetPodWithContainers := ReplicaSetPodWithContainers{
			Name:      pod.Name,
			StartTime: pod.Status.StartTime,
		}
		for _, containerStatus := range pod.Status.ContainerStatuses {
			podContainer := PodContainer{
				Name:         containerStatus.Name,
				RestartCount: containerStatus.RestartCount,
				State:        containerStatus.State,
			}
			replicaSetPodWithContainers.PodContainers =
				append(replicaSetPodWithContainers.PodContainers, podContainer)
		}
		replicaSetPods.Pods = append(replicaSetPods.Pods, replicaSetPodWithContainers)
	}

	return replicaSetPods
}
