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

package service

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/errors"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	v1 "k8s.io/api/core/v1"
	client "k8s.io/client-go/kubernetes"
)

// Service is a representation of a service.
type Service struct {
	ObjectMeta api.ObjectMeta `json:"objectMeta"`
	TypeMeta   api.TypeMeta   `json:"typeMeta"`

	// InternalEndpoint of all Kubernetes services that have the same label selector as connected Replication
	// Controller. Endpoint is DNS name merged with ports.
	InternalEndpoint common.Endpoint `json:"internalEndpoint"`

	// ExternalEndpoints of all Kubernetes services that have the same label selector as connected Replication
	// Controller. Endpoint is external IP address name merged with ports.
	ExternalEndpoints []common.Endpoint `json:"externalEndpoints"`

	// Label selector of the service.
	Selector map[string]string `json:"selector"`

	// Type determines how the service will be exposed.  Valid options: ClusterIP, NodePort, LoadBalancer, ExternalName
	Type v1.ServiceType `json:"type"`

	// ClusterIP is usually assigned by the master. Valid values are None, empty string (""), or
	// a valid IP address. None can be specified for headless services when proxying is not required
	ClusterIP string `json:"clusterIP"`
}

// ServiceList contains a list of services in the cluster.
type ServiceList struct {
	ListMeta api.ListMeta `json:"listMeta"`

	// Unordered list of services.
	Services []Service `json:"services"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

// GetServiceList returns a list of all services in the cluster.
func GetServiceList(client client.Interface, nsQuery *common.NamespaceQuery,
	dsQuery *dataselect.DataSelectQuery) (*ServiceList, error) {
	log.Print("Getting list of all services in the cluster")

	channels := &common.ResourceChannels{
		ServiceList: common.GetServiceListChannel(client, nsQuery, 1),
	}

	return GetServiceListFromChannels(channels, dsQuery)
}

// GetServiceListFromChannels returns a list of all services in the cluster.
func GetServiceListFromChannels(channels *common.ResourceChannels,
	dsQuery *dataselect.DataSelectQuery) (*ServiceList, error) {
	services := <-channels.ServiceList.List
	err := <-channels.ServiceList.Error
	nonCriticalErrors, criticalError := errors.HandleError(err)
	if criticalError != nil {
		return nil, criticalError
	}

	return CreateServiceList(services.Items, nonCriticalErrors, dsQuery), nil
}

func toService(service *v1.Service) Service {
	return Service{
		ObjectMeta:        api.NewObjectMeta(service.ObjectMeta),
		TypeMeta:          api.NewTypeMeta(api.ResourceKindService),
		InternalEndpoint:  common.GetInternalEndpoint(service.Name, service.Namespace, service.Spec.Ports),
		ExternalEndpoints: common.GetExternalEndpoints(service),
		Selector:          service.Spec.Selector,
		ClusterIP:         service.Spec.ClusterIP,
		Type:              service.Spec.Type,
	}
}

// CreateServiceList returns paginated service list based on given service array and pagination query.
func CreateServiceList(services []v1.Service, nonCriticalErrors []error, dsQuery *dataselect.DataSelectQuery) *ServiceList {
	serviceList := &ServiceList{
		Services: make([]Service, 0),
		ListMeta: api.ListMeta{TotalItems: len(services)},
		Errors:   nonCriticalErrors,
	}

	serviceCells, filteredTotal := dataselect.GenericDataSelectWithFilter(toCells(services), dsQuery)
	services = fromCells(serviceCells)
	serviceList.ListMeta = api.ListMeta{TotalItems: filteredTotal}

	for _, service := range services {
		serviceList.Services = append(serviceList.Services, toService(&service))
	}

	return serviceList
}
