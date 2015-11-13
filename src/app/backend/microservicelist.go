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

// List of microservices in the cluster.
type MicroserviceList struct {
	// Unordered list of microservices.
	Microservices []Microservice `json:"microservices"`
}

// Microservice is a Kubernetes replica set plus zero or more Kubernetes services.
type Microservice struct {
	// Name of the microservice, derived from the replica set.
	Name string `json:"name"`

	// Replica set that represents the microservice.
	ReplicaSet ReplicaSet `json:"replicaSet"`

	// TODO(bryk): Add service field here.
}

// Replica set model to represent in the user interface.
type ReplicaSet struct {
	// Number of pods that are currently running.
	PodsRunning int `json:"podsRunning"`

	// Number of pods that are desired to run in this replica set.
	PodsDesired int `json:"podsDesired"`

	// Container images of the replica set.
	ContainerImages []string `json:"containerImages"`
}

// Returns a list of all microservices in the cluster.
func GetMicroserviceList(client *client.Client) (*MicroserviceList, error) {
	list, err := client.ReplicationControllers(api.NamespaceAll).
		List(labels.Everything(), fields.Everything())

	if err != nil {
		return nil, err
	}

	microserviceList := &MicroserviceList{}

	for _, element := range list.Items {
		var containerImages []string

		for _, container := range element.Spec.Template.Spec.Containers {
			containerImages = append(containerImages, container.Image)
		}

		microserviceList.Microservices = append(microserviceList.Microservices, Microservice{
			Name: element.ObjectMeta.Name,
			ReplicaSet: ReplicaSet{
				ContainerImages: containerImages,
				PodsRunning:     element.Status.Replicas,
				PodsDesired:     element.Spec.Replicas,
			},
		})
	}

	return microserviceList, nil
}
