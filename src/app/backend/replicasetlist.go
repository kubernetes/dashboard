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
	"strconv"
	"strings"
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

	// Namespace this Replica Set is in.
	Namespace string `json:"namespace"`

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

	// Time the replica set was created.
	CreationTime unversioned.Time `json:"creationTime"`

	// Internal endpoints of all Kubernetes services have the same label selector as this Replica Set.
	// Endpoint is DNS name merged with ports.
	InternalEndpoints []string `json:"internalEndpoints"`

	// External endpoints of all Kubernetes services have the same label selector as this Replica Set.
	// Endpoint is external IP address name merged with ports.
	ExternalEndpoints []string `json:"externalEndpoints"`
}

// Returns a list of all Replica Sets in the cluster.
func GetReplicaSetList(client *client.Client) (*ReplicaSetList, error) {
	replicaSets, err := client.ReplicationControllers(api.NamespaceAll).
		List(labels.Everything(), fields.Everything())

	if err != nil {
		return nil, err
	}

	services, err := client.Services(api.NamespaceAll).
		List(labels.Everything(), fields.Everything())

	if err != nil {
		return nil, err
	}

	return getReplicaSetList(replicaSets.Items, services.Items), nil
}

// Returns a list of all Replica Set model objects in the cluster, based on all Kubernetes
// Replica Set and Service API objects.
// The function processes all Replica Sets API objects and finds matching Services for them.
func getReplicaSetList(
	replicaSets []api.ReplicationController, services []api.Service) *ReplicaSetList {

	replicaSetList := &ReplicaSetList{}

	for _, replicaSet := range replicaSets {
		var containerImages []string
		for _, container := range replicaSet.Spec.Template.Spec.Containers {
			containerImages = append(containerImages, container.Image)
		}

		matchingServices := getMatchingServices(services, &replicaSet)
		var internalEndpoints []string
		var externalEndpoints []string
		for _, service := range matchingServices {
			internalEndpoints = append(internalEndpoints,
				getInternalEndpoint(service.Name, service.Namespace, service.Spec.Ports))
			for _, externalIp := range service.Status.LoadBalancer.Ingress {
				externalEndpoints = append(externalEndpoints,
					getExternalEndpoint(externalIp.Hostname, service.Spec.Ports))
			}
		}

		replicaSetList.ReplicaSets = append(replicaSetList.ReplicaSets, ReplicaSet{
			Name:              replicaSet.ObjectMeta.Name,
			Namespace:         replicaSet.ObjectMeta.Namespace,
			Description:       replicaSet.Annotations[DescriptionAnnotationKey],
			Labels:            replicaSet.ObjectMeta.Labels,
			PodsRunning:       replicaSet.Status.Replicas,
			PodsPending:       replicaSet.Spec.Replicas - replicaSet.Status.Replicas,
			ContainerImages:   containerImages,
			CreationTime:      replicaSet.ObjectMeta.CreationTimestamp,
			InternalEndpoints: internalEndpoints,
			ExternalEndpoints: externalEndpoints,
		})
	}

	return replicaSetList
}

// Returns internal endpoint name for the given service properties, e.g.,
// "my-service.namespace 80/TCP" or "my-service 53/TCP,53/UDP".
func getInternalEndpoint(serviceName string, namespace string, ports []api.ServicePort) string {
	name := serviceName
	if namespace != api.NamespaceDefault {
		name = name + "." + namespace
	}

	return name + getServicePortsName(ports)
}

// Returns external endpoint name for the given service properties.
func getExternalEndpoint(serviceIp string, ports []api.ServicePort) string {
	return serviceIp + getServicePortsName(ports)
}

// Gets human readable name for the given service ports list.
func getServicePortsName(ports []api.ServicePort) string {
	var portsString []string
	for _, port := range ports {
		portsString = append(portsString, strconv.Itoa(port.Port)+"/"+string(port.Protocol))
	}
	if len(portsString) > 0 {
		return " " + strings.Join(portsString, ",")
	} else {
		return ""
	}
}

// Returns all services that target the same Pods (or subset) as the given Replica Set.
func getMatchingServices(services []api.Service,
	replicaSet *api.ReplicationController) []api.Service {

	var matchingServices []api.Service
	for _, service := range services {
		if isServiceMatchingReplicaSet(service.Spec.Selector, replicaSet.Spec.Selector) {
			matchingServices = append(matchingServices, service)
		}
	}
	return matchingServices
}

// Returns true when a Service with the given selector targets the same Pods (or subset) that
// a Replica Set with the given selector.
func isServiceMatchingReplicaSet(serviceSelector map[string]string,
	replicaSetSpecSelector map[string]string) bool {

	// If service has no selectors, then assume it targets different Pods.
	if len(serviceSelector) == 0 {
		return false
	}
	for label, value := range serviceSelector {
		if rsValue, ok := replicaSetSpecSelector[label]; !ok || rsValue != value {
			return false
		}
	}
	return true
}
