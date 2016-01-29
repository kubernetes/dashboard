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
	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/api/unversioned"
	client "k8s.io/kubernetes/pkg/client/unversioned"
	"k8s.io/kubernetes/pkg/fields"
	"k8s.io/kubernetes/pkg/labels"
)

type ReplicaSetWithPods struct {
	ReplicaSet *api.ReplicationController
	Pods       *api.PodList
}

// ReplicaSetPodInfo represents aggregate information about replica set pods.
type ReplicaSetPodInfo struct {
	// Number of pods that are created.
	Current int `json:"current"`

	// Number of pods that are desired in this Replica Set.
	Desired int `json:"desired"`

	// Number of pods that are currently running.
	Running int `json:"running"`

	// Number of pods that are currently waiting.
	Pending int `json:"pending"`

	// Number of pods that are failed.
	Failed int `json:"failed"`
}

// Returns structure containing ReplicaSet and Pods for the given replica set.
func getRawReplicaSetWithPods(client client.Interface, namespace, name string) (
	*ReplicaSetWithPods, error) {
	replicaSet, err := client.ReplicationControllers(namespace).Get(name)
	if err != nil {
		return nil, err
	}

	labelSelector := labels.SelectorFromSet(replicaSet.Spec.Selector)
	pods, err := client.Pods(namespace).List(
		unversioned.ListOptions{
			LabelSelector: unversioned.LabelSelector{labelSelector},
			FieldSelector: unversioned.FieldSelector{fields.Everything()},
		})

	if err != nil {
		return nil, err
	}

	replicaSetAndPods := &ReplicaSetWithPods{
		ReplicaSet: replicaSet,
		Pods:       pods,
	}
	return replicaSetAndPods, nil
}

// Retrieves Pod list that belongs to a Replica Set.
func getRawReplicaSetPods(client client.Interface, namespace, name string) (*api.PodList, error) {
	replicaSetAndPods, err := getRawReplicaSetWithPods(client, namespace, name)
	if err != nil {
		return nil, err
	}
	return replicaSetAndPods.Pods, nil
}

// Returns aggregate information about replica set pods.
func getReplicaSetPodInfo(replicaSet *api.ReplicationController, pods []api.Pod) ReplicaSetPodInfo {
	result := ReplicaSetPodInfo{
		Current: replicaSet.Status.Replicas,
		Desired: replicaSet.Spec.Replicas,
	}

	for _, pod := range pods {
		switch pod.Status.Phase {
		case api.PodRunning:
			result.Running++
		case api.PodPending:
			result.Pending++
		case api.PodFailed:
			result.Failed++
		}
	}

	return result
}
