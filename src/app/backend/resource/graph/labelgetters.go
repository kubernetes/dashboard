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

package graph

import (
	k8sClient "k8s.io/kubernetes/pkg/client/unversioned"
	"k8s.io/kubernetes/pkg/labels"
)

func getDeploymentLabel(client k8sClient.Interface, namespace string, name string) (labels.Set, error) {
	replicationController, err := client.Extensions().Deployments(namespace).Get(name)
	if err != nil {
		return nil, err
	}
	return replicationController.Spec.Selector.MatchLabels, nil
}

func getDeamonSetLabel(client k8sClient.Interface, namespace string, name string) (labels.Set, error) {
	replicationController, err := client.Extensions().DaemonSets(namespace).Get(name)
	if err != nil {
		return nil, err
	}
	return replicationController.Spec.Selector.MatchLabels, nil
}

func getReplicaSetLabel(client k8sClient.Interface, namespace string, name string) (labels.Set, error) {
	replicationController, err := client.Extensions().ReplicaSets(namespace).Get(name)
	if err != nil {
		return nil, err
	}
	return replicationController.Spec.Selector.MatchLabels, nil
}

func getReplicationControllerLabel(client k8sClient.Interface, namespace string, name string) (labels.Set, error) {
	replicationController, err := client.ReplicationControllers(namespace).Get(name)
	if err != nil {
		return nil, err
	}
	return replicationController.Spec.Selector, nil
}

var ResourceLabelGetters = map[string]func(k8sClient.Interface, string, string)(labels.Set, error){
	"deployments": getDeploymentLabel,
	"deamonsets": getDeamonSetLabel,
	"replicasets": getReplicaSetLabel,
	"replicationcontrollers": getReplicationControllerLabel,
}
