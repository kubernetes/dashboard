// Copyright 2017 The Kubernetes Authors.
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

	api "k8s.io/api/core/v1"
)

// Endpoint describes an endpoint that is host and a list of available ports for that host.
type Endpoint struct {
	// Hostname, either as a domain name or IP address.
	Host string `json:"host"`

	// List of ports opened for this endpoint on the hostname.
	Ports []ServicePort `json:"ports"`
}

// GetExternalEndpoints returns endpoints that are externally reachable for a service.
func GetExternalEndpoints(service *api.Service) []Endpoint {
	var externalEndpoints []Endpoint
	if service.Spec.Type == api.ServiceTypeLoadBalancer {
		for _, ingress := range service.Status.LoadBalancer.Ingress {
			externalEndpoints = append(externalEndpoints, getExternalEndpoint(ingress, service.Spec.Ports))
		}
	}

	for _, ip := range service.Spec.ExternalIPs {
		externalEndpoints = append(externalEndpoints, Endpoint{
			Host:  ip,
			Ports: GetServicePorts(service.Spec.Ports),
		})
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
