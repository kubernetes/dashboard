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
	"k8s.io/kubernetes/pkg/api/unversioned"
	client "k8s.io/kubernetes/pkg/client/unversioned"
)

// Detailed information about a Replica Set.
type ReplicaSetDetail struct {
	// Name of the Replica Set.
	Name string `json:"name"`

	// Namespace the Replica Set is in.
	Namespace string `json:"namespace"`

	// Label mapping of the Replica Set.
	Labels map[string]string `json:"labels"`

	// Label selector of the Replica Set.
	LabelSelector map[string]string `json:"labelSelector"`

	// Container image list of the pod template specified by this Replica Set.
	ContainerImages []string `json:"containerImages"`

	// Number of Pod replicas specified in the spec.
	PodsDesired int `json:"podsDesired"`

	// Actual number of Pod replicas running.
	PodsRunning int `json:"podsRunning"`

	// Detailed information about Pods belonging to this Replica Set.
	Pods []ReplicaSetPod `json:"pods"`
}

// Detailed information about a Pod that belongs to a Replica Set.
type ReplicaSetPod struct {
	// Name of the Pod.
	Name string `json:"name"`

	// Time the Pod has started. Empty if not started.
	StartTime *unversioned.Time `json:"startTime"`

	// IP address of the Pod.
	PodIP string `json:"podIP"`

	// Name of the Node this Pod runs on.
	NodeName string `json:"nodeName"`
}

// Returns detailed information about the given replica set in the given namespace.
func GetReplicaSetDetail(client *client.Client, namespace string, name string) (
	*ReplicaSetDetail, error) {

	replicaSetWithPods, err := getRawReplicaSetWithPods(client, namespace, name)
	if err != nil {
		return nil, err
	}
	replicaSet := replicaSetWithPods.ReplicaSet
	pods := replicaSetWithPods.Pods

	replicaSetDetail := &ReplicaSetDetail{
		Name:          replicaSet.Name,
		Namespace:     replicaSet.Namespace,
		Labels:        replicaSet.ObjectMeta.Labels,
		LabelSelector: replicaSet.Spec.Selector,
		PodsRunning:   replicaSet.Status.Replicas,
		PodsDesired:   replicaSet.Spec.Replicas,
	}

	for _, container := range replicaSet.Spec.Template.Spec.Containers {
		replicaSetDetail.ContainerImages = append(replicaSetDetail.ContainerImages, container.Image)
	}

	for _, pod := range pods.Items {
		podDetail := ReplicaSetPod{
			Name:      pod.Name,
			StartTime: pod.Status.StartTime,
			PodIP:     pod.Status.PodIP,
			NodeName:  pod.Spec.NodeName,
		}
		replicaSetDetail.Pods = append(replicaSetDetail.Pods, podDetail)
	}

	return replicaSetDetail, nil
}
