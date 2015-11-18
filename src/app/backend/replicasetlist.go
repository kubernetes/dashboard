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
	client "k8s.io/kubernetes/pkg/client/unversioned"
	"k8s.io/kubernetes/pkg/fields"
	"k8s.io/kubernetes/pkg/labels"
)

// List of Replica Sets in the cluster.
type ReplicaSetList struct {
	// Unordered list of Replica Sets.
	ReplicaSets []ReplicaSet `json:"replicaSets"`
}

// Kubernetes Replica Set (aka. Replication Controller) plus zero or more Kubernetes services that
// target the Replica Set.
type ReplicaSet struct {
	// Name of the Replica Set.
	Name string `json:"name"`

	// Number of pods that are currently running.
	PodsRunning int `json:"podsRunning"`

	// Number of pods that are desired to run in this replica set.
	PodsDesired int `json:"podsDesired"`

	// Container images of the replica set.
	ContainerImages []string `json:"containerImages"`

	// TODO(bryk): Add service information here.
}

// Returns a list of all Replica Sets in the cluster.
func GetReplicaSetList(client *client.Client) (*ReplicaSetList, error) {
	list, err := client.ReplicationControllers(api.NamespaceAll).
		List(labels.Everything(), fields.Everything())

	if err != nil {
		return nil, err
	}

	replicaSetList := &ReplicaSetList{}

	for _, replicaSet := range list.Items {
		var containerImages []string

		for _, container := range replicaSet.Spec.Template.Spec.Containers {
			containerImages = append(containerImages, container.Image)
		}

		replicaSetList.ReplicaSets = append(replicaSetList.ReplicaSets, ReplicaSet{
			Name:            replicaSet.ObjectMeta.Name,
			ContainerImages: containerImages,
			PodsRunning:     replicaSet.Status.Replicas,
			PodsDesired:     replicaSet.Spec.Replicas,
		})
	}

	return replicaSetList, nil
}
