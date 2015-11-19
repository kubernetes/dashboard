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

	// Human readable description of this Replica Set.
	Description string `json:"description"`

	// Label of this Replica Set.
	Labels map[string]string `json:"labels"`

	// Number of pods that are currently running.
	PodsRunning int `json:"podsRunning"`

	// Number of pods that are pending in this Replica Set.
	PodsPending int `json:"podsPending"`

	// Container images of the Replica Set.
	ContainerImages []string `json:"containerImages"`

	// Age in milliseconds of the oldest replica in the Set.
	Age uint64 `json:"age"`

	// Internal endpoints of all Kubernetes services have the same label selector as this Replica Set.
	InternalEndpoints []string `json:"internalEndpoints"`

	// External endpoints of all Kubernetes services have the same label selector as this Replica Set.
	ExternalEndpoints []string `json:"externalEndpoints"`
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
			Name: replicaSet.ObjectMeta.Name,
			// TODO(bryk): This field contains test value. Implement it.
			Description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
				"Nulla metus nibh, iaculis a consectetur vitae, imperdiet pellentesque turpis.",
			Labels:          replicaSet.ObjectMeta.Labels,
			PodsRunning:     replicaSet.Status.Replicas,
			PodsPending:     replicaSet.Spec.Replicas - replicaSet.Status.Replicas,
			ContainerImages: containerImages,
			// TODO(bryk): This field contains test value. Implement it.
			Age: 18,
			// TODO(bryk): This field contains test value. Implement it.
			InternalEndpoints: []string{"webapp"},
			// TODO(bryk): This field contains test value. Implement it.
			ExternalEndpoints: []string{"81.76.02.198:80"},
		})
	}

	return replicaSetList, nil
}
