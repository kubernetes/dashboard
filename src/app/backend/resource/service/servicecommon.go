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
	"k8s.io/kubernetes/pkg/api"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
)

// ToService returns api service object based on kubernetes service object
func ToService(service *api.Service) Service {
	return Service{
		ObjectMeta:        common.NewObjectMeta(service.ObjectMeta),
		TypeMeta:          common.NewTypeMeta(common.ResourceKindService),
		InternalEndpoint:  common.GetInternalEndpoint(service.Name, service.Namespace, service.Spec.Ports),
		ExternalEndpoints: common.GetExternalEndpoints(service),
		Selector:          service.Spec.Selector,
		ClusterIP:         service.Spec.ClusterIP,
		Type:              service.Spec.Type,
	}
}

// ToServiceDetail returns api service object based on kubernetes service object
func ToServiceDetail(service *api.Service) ServiceDetail {
	return ServiceDetail{
		ObjectMeta:        common.NewObjectMeta(service.ObjectMeta),
		TypeMeta:          common.NewTypeMeta(common.ResourceKindService),
		InternalEndpoint:  common.GetInternalEndpoint(service.Name, service.Namespace, service.Spec.Ports),
		ExternalEndpoints: common.GetExternalEndpoints(service),
		Selector:          service.Spec.Selector,
		ClusterIP:         service.Spec.ClusterIP,
		Type:              service.Spec.Type,
	}
}

// CreateServiceList returns paginated service list based on given service array
// and pagination query.
func CreateServiceList(services []api.Service, dsQuery *dataselect.DataSelectQuery) *ServiceList {
	serviceList := &ServiceList{
		Services: make([]Service, 0),
		ListMeta: common.ListMeta{TotalItems: len(services)},
	}

	services = fromCells(dataselect.GenericDataSelect(toCells(services), dsQuery))

	for _, service := range services {
		serviceList.Services = append(serviceList.Services, ToService(&service))
	}

	return serviceList
}

// The code below allows to perform complex data section on []api.Service

type ServiceCell api.Service

func (self ServiceCell) GetProperty(name dataselect.PropertyName) dataselect.ComparableValue {
	switch name {
	case dataselect.NameProperty:
		return dataselect.StdComparableString(self.ObjectMeta.Name)
	case dataselect.CreationTimestampProperty:
		return dataselect.StdComparableTime(self.ObjectMeta.CreationTimestamp.Time)
	case dataselect.NamespaceProperty:
		return dataselect.StdComparableString(self.ObjectMeta.Namespace)
	default:
		// if name is not supported then just return a constant dummy value, sort will have no effect.
		return nil
	}
}

func toCells(std []api.Service) []dataselect.DataCell {
	cells := make([]dataselect.DataCell, len(std))
	for i := range std {
		cells[i] = ServiceCell(std[i])
	}
	return cells
}

func fromCells(cells []dataselect.DataCell) []api.Service {
	std := make([]api.Service, len(cells))
	for i := range std {
		std[i] = api.Service(cells[i].(ServiceCell))
	}
	return std
}
