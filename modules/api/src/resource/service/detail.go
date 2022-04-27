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
	"context"
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/errors"
	"github.com/kubernetes/dashboard/src/app/backend/resource/endpoint"
	v1 "k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	k8sClient "k8s.io/client-go/kubernetes"
)

// Service is a representation of a service.
type ServiceDetail struct {
	// Extends list item structure.
	Service `json:",inline"`

	// List of Endpoint obj. that are endpoints of this Service.
	EndpointList endpoint.EndpointList `json:"endpointList"`

	// Show the value of the SessionAffinity of the Service.
	SessionAffinity v1.ServiceAffinity `json:"sessionAffinity"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

// GetServiceDetail gets service details.
func GetServiceDetail(client k8sClient.Interface, namespace, name string) (*ServiceDetail, error) {
	log.Printf("Getting details of %s service in %s namespace", name, namespace)
	serviceData, err := client.CoreV1().Services(namespace).Get(context.TODO(), name, metaV1.GetOptions{})
	if err != nil {
		return nil, err
	}

	endpointList, err := endpoint.GetServiceEndpoints(client, namespace, name)
	nonCriticalErrors, criticalError := errors.HandleError(err)
	if criticalError != nil {
		return nil, criticalError
	}

	service := toServiceDetail(serviceData, *endpointList, nonCriticalErrors)
	return &service, nil
}

func toServiceDetail(service *v1.Service, endpointList endpoint.EndpointList, nonCriticalErrors []error) ServiceDetail {
	return ServiceDetail{
		Service:         toService(service),
		EndpointList:    endpointList,
		SessionAffinity: service.Spec.SessionAffinity,
		Errors:          nonCriticalErrors,
	}
}
