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

type ReplicaSetWithPods struct {
	ReplicaSet *api.ReplicationController
	Pods       *api.PodList
}

// Returns structure containing ReplicaSet and Pods for the given replica set.
func getRawReplicaSetWithPods(client *client.Client, namespace string, name string) (
	*ReplicaSetWithPods, error) {
	replicaSet, err := client.ReplicationControllers(namespace).Get(name)
	if err != nil {
		return nil, err
	}

	labelSelector := labels.SelectorFromSet(replicaSet.Spec.Selector)
	pods, err := client.Pods(namespace).List(labelSelector, fields.Everything())

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
func getRawReplicaSetPods(client *client.Client, namespace string, name string) (
	*api.PodList, error) {
	replicaSetAndPods, err := getRawReplicaSetWithPods(client, namespace, name)
	if err != nil {
		return nil, err
	}
	return replicaSetAndPods.Pods, nil
}
