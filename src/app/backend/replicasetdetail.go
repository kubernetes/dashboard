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
	"bytes"
	"log"

	"k8s.io/kubernetes/pkg/api"
	unversioned "k8s.io/kubernetes/pkg/api/unversioned"
	client "k8s.io/kubernetes/pkg/client/unversioned"
	"k8s.io/kubernetes/pkg/fields"
	"k8s.io/kubernetes/pkg/labels"
)

// ReplicaSetDetail represents detailed information about a Replica Set.
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

	// Aggregate information about pods of this replica set.
	PodInfo ReplicaSetPodInfo `json:"podInfo"`

	// Detailed information about Pods belonging to this Replica Set.
	Pods []ReplicaSetPod `json:"pods"`

	// Detailed information about service related to Replica Set.
	Services []ServiceDetail `json:"services"`

	// True when the data contains at least one pod with metrics information, false otherwise.
	HasMetrics bool `json:"hasMetrics"`
}

// Detailed information about a Pod that belongs to a Replica Set.
type ReplicaSetPod struct {
	// Name of the Pod.
	Name string `json:"name"`

	// Status of the Pod. See Kubernetes API for reference.
	PodPhase api.PodPhase `json:"podPhase"`

	// Time the Pod has started. Empty if not started.
	StartTime *unversioned.Time `json:"startTime"`

	// IP address of the Pod.
	PodIP string `json:"podIP"`

	// Name of the Node this Pod runs on.
	NodeName string `json:"nodeName"`

	// Count of containers restarts.
	RestartCount int `json:"restartCount"`

	// Pod metrics.
	Metrics *PodMetrics `json:"metrics"`
}

// Detailed information about a Service connected to Replica Set.
type ServiceDetail struct {
	// Name of the service.
	Name string `json:"name"`

	// Internal endpoints of all Kubernetes services that have the same label selector as connected
	// Replica Set.
	// Endpoint is DNS name merged with ports.
	InternalEndpoint Endpoint `json:"internalEndpoint"`

	// External endpoints of all Kubernetes services that have the same label selector as connected
	// Replica Set.
	// Endpoint is external IP address name merged with ports.
	ExternalEndpoints []Endpoint `json:"externalEndpoints"`

	// Label selector of the service.
	Selector map[string]string `json:"selector"`
}

// Port and protocol pair of, e.g., a service endpoint.
type ServicePort struct {
	// Positive port number.
	Port int `json:"port"`

	// Protocol name, e.g., TCP or UDP.
	Protocol api.Protocol `json:"protocol"`
}

// Describes an endpoint that is host and a list of available ports for that host.
type Endpoint struct {
	// Hostname, either as a domain name or IP address.
	Host string `json:"host"`

	// List of ports opened for this endpoint on the hostname.
	Ports []ServicePort `json:"ports"`
}

// Information needed to update replica set
type ReplicaSetSpec struct {
	// Replicas (pods) number in replicas set
	Replicas int `json:"replicas"`
}

// Returns detailed information about the given replica set in the given namespace.
func GetReplicaSetDetail(client client.Interface, heapsterClient HeapsterClient,
	namespace, name string) (*ReplicaSetDetail, error) {
	log.Printf("Getting details of %s replica set in %s namespace", name, namespace)

	replicaSetWithPods, err := getRawReplicaSetWithPods(client, namespace, name)
	if err != nil {
		return nil, err
	}
	replicaSet := replicaSetWithPods.ReplicaSet
	pods := replicaSetWithPods.Pods

	replicaSetMetricsByPod, err := getReplicaSetPodsMetrics(pods, heapsterClient, namespace, name)
	if err != nil {
		log.Printf("Skipping Heapster metrics because of error: %s\n", err)
	}

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
		PodInfo:       getReplicaSetPodInfo(replicaSet, pods.Items),
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
			PodPhase:     pod.Status.Phase,
			StartTime:    pod.Status.StartTime,
			PodIP:        pod.Status.PodIP,
			NodeName:     pod.Spec.NodeName,
			RestartCount: getRestartCount(pod),
		}
		if replicaSetMetricsByPod != nil {
			metric := replicaSetMetricsByPod.MetricsMap[pod.Name]
			podDetail.Metrics = &metric
			replicaSetDetail.HasMetrics = true
		}
		replicaSetDetail.Pods = append(replicaSetDetail.Pods, podDetail)
	}

	return replicaSetDetail, nil
}

// TODO(floreks): This should be transactional to make sure that RC will not be deleted without
// TODO(floreks): Should related services be deleted also?
// Deletes replica set with given name in given namespace and related pods
func DeleteReplicaSetWithPods(client client.Interface, namespace, name string) error {
	log.Printf("Deleting %s replica set from %s namespace", name, namespace)

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

	log.Printf("Successfully deleted %s replica set from %s namespace", name, namespace)

	return nil
}

// Updates number of replicas in Replica Set based on Replica Set Spec
func UpdateReplicasCount(client client.Interface, namespace, name string,
	replicaSetSpec *ReplicaSetSpec) error {
	log.Printf("Updating replicas count to %d for %s replica set from %s namespace",
		replicaSetSpec.Replicas, name, namespace)

	replicaSet, err := client.ReplicationControllers(namespace).Get(name)
	if err != nil {
		return err
	}

	replicaSet.Spec.Replicas = replicaSetSpec.Replicas

	_, err = client.ReplicationControllers(namespace).Update(replicaSet)
	if err != nil {
		return err
	}

	log.Printf("Successfully updated replicas count to %d for %s replica set from %s namespace",
		replicaSetSpec.Replicas, name, namespace)

	return nil
}

// Returns detailed information about service from given service
func getServiceDetail(service api.Service) ServiceDetail {
	var externalEndpoints []Endpoint
	for _, externalIp := range service.Status.LoadBalancer.Ingress {
		externalEndpoints = append(externalEndpoints,
			getExternalEndpoint(externalIp, service.Spec.Ports))
	}

	serviceDetail := ServiceDetail{
		Name: service.ObjectMeta.Name,
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

// Returns internal endpoint name for the given service properties, e.g.,
// "my-service.namespace 80/TCP" or "my-service 53/TCP,53/UDP".
func getInternalEndpoint(serviceName, namespace string, ports []api.ServicePort) Endpoint {

	name := serviceName
	if namespace != api.NamespaceDefault {
		bufferName := bytes.NewBufferString(name)
		bufferName.WriteString(".")
		bufferName.WriteString(namespace)
		name = bufferName.String()
	}

	return Endpoint{
		Host:  name,
		Ports: getServicePorts(ports),
	}
}

// Returns external endpoint name for the given service properties.
func getExternalEndpoint(ingress api.LoadBalancerIngress, ports []api.ServicePort) Endpoint {
	var host string
	if ingress.Hostname != "" {
		host = ingress.Hostname
	} else {
		host = ingress.IP
	}
	return Endpoint{
		Host:  host,
		Ports: getServicePorts(ports),
	}
}

// Gets human readable name for the given service ports list.
func getServicePorts(apiPorts []api.ServicePort) []ServicePort {
	var ports []ServicePort
	for _, port := range apiPorts {
		ports = append(ports, ServicePort{port.Port, port.Protocol})
	}
	return ports
}
