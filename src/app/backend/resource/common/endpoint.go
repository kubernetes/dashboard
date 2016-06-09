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

package common

import (
	"bytes"

	"k8s.io/kubernetes/pkg/api"
)

// Endpoint describes an endpoint that is host and a list of available ports for that host.
type Endpoint struct {
	// Hostname, either as a domain name or IP address.
	Host string `json:"host"`

	// List of ports opened for this endpoint on the hostname.
	Ports []ServicePort `json:"ports"`
}

// GetExternalEndpoints returns array of external endpoints for resources targeted by given
// selector.
func GetExternalEndpoints(resourceSelector map[string]string, allPods []api.Pod,
	service api.Service, nodes []api.Node) []Endpoint {

	var externalEndpoints []Endpoint
	resourcePods := FilterPodsBySelector(allPods, resourceSelector)

	if service.Spec.Type == api.ServiceTypeNodePort {
		externalEndpoints = getNodePortEndpoints(resourcePods, service, nodes)
	} else if service.Spec.Type == api.ServiceTypeLoadBalancer {
		for _, ingress := range service.Status.LoadBalancer.Ingress {
			externalEndpoints = append(externalEndpoints, getExternalEndpoint(
				ingress, service.Spec.Ports))
		}

		if len(externalEndpoints) == 0 {
			externalEndpoints = getNodePortEndpoints(resourcePods,
				service, nodes)
		}
	}

	if len(externalEndpoints) == 0 && (service.Spec.Type == api.ServiceTypeNodePort ||
		service.Spec.Type == api.ServiceTypeLoadBalancer) {
		externalEndpoints = getLocalhostEndpoints(service)
	}

	return externalEndpoints
}

// GetInternalEndpoint returns internal endpoint name for the given service properties, e.g.,
// "my-service.namespace 80/TCP" or "my-service 53/TCP,53/UDP".
func GetInternalEndpoint(serviceName, namespace string, ports []api.ServicePort) Endpoint {
	name := serviceName

	if namespace != api.NamespaceDefault && len(namespace) > 0 && len(serviceName) > 0 {
		bufferName := bytes.NewBufferString(name)
		bufferName.WriteString(".")
		bufferName.WriteString(namespace)
		name = bufferName.String()
	}

	return Endpoint{
		Host:  name,
		Ports: GetServicePorts(ports),
	}
}

// Returns array of external endpoints for specified pods.
func getNodePortEndpoints(pods []api.Pod, service api.Service, nodes []api.Node) []Endpoint {
	var externalEndpoints []Endpoint
	var addresses []api.NodeAddress

	for _, pod := range pods {
		node := GetNodeByName(nodes, pod.Spec.NodeName)
		if node == nil {
			continue
		}

		addresses = append(addresses, node.Status.Addresses...)
	}

	addresses = getUniqueExternalAddresses(addresses)

	for _, address := range addresses {
		for _, port := range service.Spec.Ports {
			externalEndpoints = append(externalEndpoints, Endpoint{
				Host: address.Address,
				Ports: []ServicePort{
					{
						Protocol: port.Protocol,
						Port:     port.NodePort,
					},
				},
			})
		}
	}

	return externalEndpoints
}

// Returns localhost endpoints for specified node port or load balancer service.
func getLocalhostEndpoints(service api.Service) []Endpoint {
	var externalEndpoints []Endpoint
	for _, port := range service.Spec.Ports {
		externalEndpoints = append(externalEndpoints, Endpoint{
			Host: "localhost",
			Ports: []ServicePort{
				{
					Protocol: port.Protocol,
					Port:     port.NodePort,
				},
			},
		})
	}
	return externalEndpoints
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
		Ports: GetServicePorts(ports),
	}
}

// Returns only unique external ip addresses.
func getUniqueExternalAddresses(addresses []api.NodeAddress) []api.NodeAddress {
	visited := make(map[string]bool, 0)
	result := make([]api.NodeAddress, 0)

	for _, elem := range addresses {
		if !visited[elem.Address] && elem.Type == api.NodeExternalIP {
			visited[elem.Address] = true
			result = append(result, elem)
		}
	}

	return result
}

// GetNodeByName returns the node with the given name from the list
func GetNodeByName(nodes []api.Node, nodeName string) *api.Node {
	for _, node := range nodes {
		if node.ObjectMeta.Name == nodeName {
			return &node
		}
	}

	return nil
}
