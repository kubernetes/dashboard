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

	// Detailed information about service related to Replica Set.
	Services []ServiceDetail `json:"services"`
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

	// Count of containers restarts.
	RestartCount int `json:"restartCount"`
}

// Detailed information about a Service connected to Replica Set.
type ServiceDetail struct {
	// Internal endpoints of all Kubernetes services that have the same label selector as connected
	// Replica Set.
	// Endpoint is DNS name merged with ports.
	InternalEndpoint string `json:"internalEndpoint"`

	// External endpoints of all Kubernetes services that have the same label selector as connected
	// Replica Set.
	// Endpoint is external IP address name merged with ports.
	ExternalEndpoints []string `json:"externalEndpoints"`

	// Label selector of the service.
	Selector map[string]string `json:"selector"`
}

// Information needed to update replica set
type ReplicaSetSpec struct {
	// Replicas (pods) number in replicas set
	Replicas int `json:"replicas"`
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

	services, err := client.Services(namespace).List(unversioned.ListOptions{
		LabelSelector: unversioned.LabelSelector{labels.Everything()},
		FieldSelector: unversioned.FieldSelector{fields.Everything()},
	})

	if err != nil {
		return nil, err
	}

	replicaSetDetail := &ReplicaSetDetail{
		Name:          replicaSet.Name,
		Namespace:     replicaSet.Namespace,
		Labels:        replicaSet.ObjectMeta.Labels,
		LabelSelector: replicaSet.Spec.Selector,
		PodsRunning:   replicaSet.Status.Replicas,
		PodsDesired:   replicaSet.Spec.Replicas,
	}

	matchingServices := getMatchingServices(services.Items, replicaSet)

	for _, service := range matchingServices {
		replicaSetDetail.Services = append(replicaSetDetail.Services, getServiceDetail(service))
	}

	for _, container := range replicaSet.Spec.Template.Spec.Containers {
		replicaSetDetail.ContainerImages = append(replicaSetDetail.ContainerImages, container.Image)
	}

	for _, pod := range pods.Items {
		podDetail := ReplicaSetPod{
			Name:         pod.Name,
			StartTime:    pod.Status.StartTime,
			PodIP:        pod.Status.PodIP,
			NodeName:     pod.Spec.NodeName,
			RestartCount: getRestartCount(pod),
		}
		replicaSetDetail.Pods = append(replicaSetDetail.Pods, podDetail)
	}

	return replicaSetDetail, nil
}

// TODO(floreks): This should be transactional to make sure that RC will not be deleted without
// TODO(floreks): Should related services be deleted also?
// Deletes replica set with given name in given namespace and related pods
func DeleteReplicaSetWithPods(client *client.Client, namespace string, name string) error {
	pods, err := getRawReplicaSetPods(client, namespace, name)
	if err != nil {
		return err
	}

	if err := client.ReplicationControllers(namespace).Delete(name); err != nil {
		return err
	}

	for _, pod := range pods.Items {
		if err := client.Pods(namespace).Delete(pod.Name, &api.DeleteOptions{}); err != nil {
			return err
		}
	}

	return nil
}

// Updates number of replicas in Replica Set based on Replica Set Spec
func UpdateReplicasCount(client client.Interface, namespace string, name string,
	replicaSetSpec *ReplicaSetSpec) error {
	replicaSet, err := client.ReplicationControllers(namespace).Get(name)
	if err != nil {
		return err
	}

	replicaSet.Spec.Replicas = replicaSetSpec.Replicas

	_, err = client.ReplicationControllers(namespace).Update(replicaSet)
	if err != nil {
		return err
	}

	return nil
}

// Returns detailed information about service from given service
func getServiceDetail(service api.Service) ServiceDetail {
	var externalEndpoints []string
	for _, externalIp := range service.Status.LoadBalancer.Ingress {
		externalEndpoints = append(externalEndpoints,
			getExternalEndpoint(externalIp.Hostname, service.Spec.Ports))
	}

	serviceDetail := ServiceDetail{
		InternalEndpoint: getInternalEndpoint(service.Name, service.Namespace,
			service.Spec.Ports),
		ExternalEndpoints: externalEndpoints,
		Selector:          service.Spec.Selector,
	}

	return serviceDetail
}

// Gets restart count of given pod (total number of its containers restarts).
func getRestartCount(pod api.Pod) int {
	restartCount := 0
	for _, containerStatus := range pod.Status.ContainerStatuses {
		restartCount += containerStatus.RestartCount
	}
	return restartCount
}
