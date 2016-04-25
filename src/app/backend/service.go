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
	"log"

	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/api/unversioned"
	client "k8s.io/kubernetes/pkg/client/unversioned"
)

// Service is a representation of a service.
type Service struct {
	// Name of the service.
	Name string `json:"name"`

	// Namespace of the service.
	Namespace string `json:"namespace"`

	// CreationTimestamp of the service.
	CreationTimestamp unversioned.Time `json:"creationTimestamp"`

	// Label mapping of the service.
	Labels map[string]string `json:"labels"`

	// InternalEndpoint of all Kubernetes services that have the same label selector as connected Replication
	// Controller. Endpoint is DNS name merged with ports.
	InternalEndpoint Endpoint `json:"internalEndpoint"`

	// ExternalEndpoints of all Kubernetes services that have the same label selector as connected Replication
	// Controller. Endpoint is external IP address name merged with ports.
	ExternalEndpoints []Endpoint `json:"externalEndpoints"`

	// Label selector of the service.
	Selector map[string]string `json:"selector"`
}

// ServiceList contains a list of services in the cluster.
type ServiceList struct {
	// Unordered list of services.
	Services []Service `json:"services"`
}

// GetService gets service details.
func GetService(client client.Interface, heapsterClient HeapsterClient, namespace, name string) (*Service, error) {
	log.Printf("Getting details of %s service in %s namespace", name, namespace)

	// TODO(maciaszczykm): Use channels.
	serviceData, err := client.Services(namespace).Get(name)
	if err != nil {
		return nil, err
	}

	service := getServiceDetails(serviceData)
	return &service, nil
}

// GetServiceList returns a list of all services in the cluster.
func GetServiceList(client *client.Client) (*ServiceList, error) {
	log.Printf("Getting list of all services in the cluster")

	channels := &ResourceChannels{
		ServiceList: getServiceListChannel(client, 1),
	}

	services := <-channels.ServiceList.List
	if err := <-channels.ServiceList.Error; err != nil {
		return nil, err
	}

	serviceList := &ServiceList{Services: make([]Service, 0)}
	for _, service := range services.Items {
		serviceList.Services = append(serviceList.Services, getServiceDetails(&service))
	}

	return serviceList, nil
}

func getServiceDetails(service *api.Service) Service {
	return Service{
		Name:              service.Name,
		Namespace:         service.Namespace,
		CreationTimestamp: service.CreationTimestamp,
		Labels:            service.Labels,
		InternalEndpoint:  getInternalEndpoint(service.Name, service.Namespace, service.Spec.Ports),
		ExternalEndpoints: []Endpoint{}, // TODO(maciaszczykm): Fill it with data.
		Selector:          service.Spec.Selector,
	}
}
