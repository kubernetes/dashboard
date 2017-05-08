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

package ingress

import (
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/fields"
	"k8s.io/apimachinery/pkg/labels"
	client "k8s.io/client-go/kubernetes"
	extensions "k8s.io/client-go/pkg/apis/extensions/v1beta1"
)

// Ingress - a single ingress returned to the frontend.
type Ingress struct {
	common.ObjectMeta `json:"objectMeta"`
	common.TypeMeta   `json:"typeMeta"`

	// External endpoints of this ingress.
	Endpoints []common.Endpoint `json:"endpoints"`
}

// IngressList - response structure for a queried ingress list.
type IngressList struct {
	common.ListMeta `json:"listMeta"`

	// Unordered list of Ingresss.
	Items []Ingress `json:"items"`
}

// GetIngressList - return all ingresses in the given namespace.
func GetIngressList(client client.Interface, namespace *common.NamespaceQuery,
	dsQuery *dataselect.DataSelectQuery) (*IngressList, error) {
	ingressList, err := client.Extensions().Ingresses(namespace.ToRequestParam()).List(metaV1.ListOptions{
		LabelSelector: labels.Everything().String(),
		FieldSelector: fields.Everything().String(),
	})
	if err != nil {
		return nil, err
	}
	return NewIngressList(ingressList.Items, dsQuery), err
}

// GetIngressListFromChannels - return all ingresses in the given namespace.
func GetIngressListFromChannels(channels *common.ResourceChannels,
	dsQuery *dataselect.DataSelectQuery) (*IngressList, error) {
	ingress := <-channels.IngressList.List
	if err := <-channels.IngressList.Error; err != nil {
		return nil, err
	}

	return NewIngressList(ingress.Items, dsQuery), nil
}

// NewIngress - creates a new instance of Ingress struct based on K8s Ingress.
func NewIngress(ingress *extensions.Ingress) *Ingress {
	modelIngress := &Ingress{
		ObjectMeta: common.NewObjectMeta(ingress.ObjectMeta),
		TypeMeta:   common.NewTypeMeta(common.ResourceKindIngress),
		Endpoints:  getEndpoints(ingress),
	}

	return modelIngress
}

func getEndpoints(ingress *extensions.Ingress) []common.Endpoint {
	endpoints := make([]common.Endpoint, 0)
	if len(ingress.Status.LoadBalancer.Ingress) > 0 {
		for _, status := range ingress.Status.LoadBalancer.Ingress {
			endpoint := common.Endpoint{Host: status.IP}
			endpoints = append(endpoints, endpoint)
		}
	}
	return endpoints
}

// NewIngressList - creates a new instance of IngressList struct based on K8s Ingress array.
func NewIngressList(ingresses []extensions.Ingress, dsQuery *dataselect.DataSelectQuery) *IngressList {
	newIngressList := &IngressList{
		ListMeta: common.ListMeta{TotalItems: len(ingresses)},
		Items:    make([]Ingress, 0),
	}

	ingresCells, filteredTotal := dataselect.GenericDataSelectWithFilter(toCells(ingresses), dsQuery)
	ingresses = fromCells(ingresCells)
	newIngressList.ListMeta = common.ListMeta{TotalItems: filteredTotal}

	for _, ingress := range ingresses {
		newIngressList.Items = append(newIngressList.Items, *NewIngress(&ingress))
	}

	return newIngressList
}
