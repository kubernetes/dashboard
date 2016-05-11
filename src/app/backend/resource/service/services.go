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

package service

import (
	"log"

	"github.com/kubernetes/dashboard/resource/common"
	"k8s.io/kubernetes/pkg/api"
	client "k8s.io/kubernetes/pkg/client/unversioned"
)

// Service is a representation of a service.
type Service struct {
	ObjectMeta common.ObjectMeta `json:"objectMeta"`
	TypeMeta   common.TypeMeta   `json:"typeMeta"`

	// InternalEndpoint of all Kubernetes services that have the same label selector as connected Replication
	// Controller. Endpoint is DNS name merged with ports.
	InternalEndpoint common.Endpoint `json:"internalEndpoint"`

	// ExternalEndpoints of all Kubernetes services that have the same label selector as connected Replication
	// Controller. Endpoint is external IP address name merged with ports.
	ExternalEndpoints []common.Endpoint `json:"externalEndpoints"`

	// Label selector of the service.
	Selector map[string]string `json:"selector"`

	// Type determines how the service will be exposed.  Valid options: ClusterIP, NodePort, LoadBalancer
	Type api.ServiceType `json:"type"`

	// ClusterIP is usually assigned by the master. Valid values are None, empty string (""), or
	// a valid IP address. None can be specified for headless services when proxying is not required
	ClusterIP string `json:"clusterIP"`
}

// ServiceList contains a list of services in the cluster.
type ServiceList struct {
	// Unordered list of services.
	Services []Service `json:"services"`
}

// GetService gets service details.
func GetService(client client.Interface, namespace, name string) (*Service, error) {
	log.Printf("Getting details of %s service in %s namespace", name, namespace)

	// TODO(maciaszczykm): Use channels.
	serviceData, err := client.Services(namespace).Get(name)
	if err != nil {
		return nil, err
	}

	service := GetServiceDetails(serviceData)
	return &service, nil
}

// GetServiceList returns a list of all services in the cluster.
func GetServiceList(client client.Interface) (*ServiceList, error) {
	log.Printf("Getting list of all services in the cluster")

	channels := &common.ResourceChannels{
		ServiceList: common.GetServiceListChannel(client, 1),
	}

	services := <-channels.ServiceList.List
	if err := <-channels.ServiceList.Error; err != nil {
		return nil, err
	}

	serviceList := &ServiceList{Services: make([]Service, 0)}
	for _, service := range services.Items {
		serviceList.Services = append(serviceList.Services, GetServiceDetails(&service))
	}

	return serviceList, nil
}

// GetServiceDetails returns api service object based on kubernetes service object
func GetServiceDetails(service *api.Service) Service {
	return Service{
		ObjectMeta:       common.NewObjectMeta(service.ObjectMeta),
		TypeMeta:         common.NewTypeMeta(common.ResourceKindService),
		InternalEndpoint: common.GetInternalEndpoint(service.Name, service.Namespace, service.Spec.Ports),
		// TODO(maciaszczykm): Fill ExternalEndpoints with data.
		Selector:  service.Spec.Selector,
		ClusterIP: service.Spec.ClusterIP,
		Type:      service.Spec.Type,
	}
}
