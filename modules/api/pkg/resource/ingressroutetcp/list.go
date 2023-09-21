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

package ingressroutetcp

import (
	"context"

	traefik "github.com/traefik/traefik/v2/pkg/provider/kubernetes/crd/generated/clientset/versioned"
	traefikv1 "github.com/traefik/traefik/v2/pkg/provider/kubernetes/crd/traefik/v1alpha1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	client "k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/dashboard/api/pkg/api"
	"k8s.io/dashboard/api/pkg/errors"
	"k8s.io/dashboard/api/pkg/resource/common"
	"k8s.io/dashboard/api/pkg/resource/dataselect"
)


type IngressRouteTCP struct {
	api.ObjectMeta `json:"objectMeta"`
	api.TypeMeta   `json:"typeMeta"`

	// Host of this ingress route.
	Entrypoints []string `json:"entrypoints"`
	Hosts       []string `json:"hosts"`
	Service     []traefikv1.ServiceTCP `json:"service"`
}

type IngressRouteTCPList struct {
	api.ListMeta `json:"listMeta"`

	// Unordered list of IngressRouteTCPs.
	Items []IngressRouteTCP `json:"items"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

// GetIngressList returns all ingresses in the given namespace.
func GetIngressRouteTCPList(client client.Interface, namespace *common.NamespaceQuery,
	dsQuery *dataselect.DataSelectQuery, config *rest.Config) (*IngressRouteTCPList, error) {
	// creates the clientset
	traefikclient, err := traefik.NewForConfig(config)
	if err != nil {
		panic(err.Error())
	}
	ingressList, err := traefikclient.TraefikV1alpha1().IngressRouteTCPs("").List(context.TODO(), metav1.ListOptions{})
	nonCriticalErrors, criticalError := errors.HandleError(err)
	if criticalError != nil {
		return nil, criticalError
	}

	return ToIngressRouteTCPList(ingressList.Items, nonCriticalErrors, dsQuery), nil
}


func getHosts(ingress *traefikv1.IngressRouteTCP) []string {
	hosts := make([]string, 0)
	set := make(map[string]struct{})

	for _, route := range ingress.Spec.Routes {
		if _, exists := set[route.Match]; !exists && len(route.Match) > 0 {
			hosts = append(hosts, route.Match)
		}

		set[route.Match] = struct{}{}
	}

	return hosts
}

func getEntrypoints(ingress *traefikv1.IngressRouteTCP) []string {
	entrypoints := make([]string, 0)
	set := make(map[string]struct{})

	for _, entrypoint := range ingress.Spec.EntryPoints {
		if _, exists := set[entrypoint]; !exists && len(entrypoint) > 0 {
			entrypoints = append(entrypoints, entrypoint)
		}

		set[entrypoint] = struct{}{}
	}

	return entrypoints
}

func getService(ingress *traefikv1.IngressRouteTCP) []traefikv1.ServiceTCP {
	service := make([]traefikv1.ServiceTCP, 0)

	for _, route := range ingress.Spec.Routes {
		service = append(service, route.Services...)

	}

	return service
}

func toIngressRouteTCP(ingress *traefikv1.IngressRouteTCP) IngressRouteTCP {
	return IngressRouteTCP{
		ObjectMeta: api.NewObjectMeta(ingress.ObjectMeta),
		TypeMeta:   api.NewTypeMeta(api.ResourceKindIngress),
		Entrypoints:  getEntrypoints(ingress),
		Hosts:      getHosts(ingress),
		Service:		getService(ingress),
	}
}

// func toIngress(ingress *v1.Ingress) Ingress {
// 	return Ingress{
// 		ObjectMeta: api.NewObjectMeta(ingress.ObjectMeta),
// 		TypeMeta:   api.NewTypeMeta(api.ResourceKindIngress),
// 		Endpoints:  getEndpoints(ingress),
// 		Hosts:      getHosts(ingress),
// 	}
// }

func ToIngressRouteTCPList(IngressRouteTCPs []traefikv1.IngressRouteTCP, nonCriticalErrors []error, dsQuery *dataselect.DataSelectQuery) *IngressRouteTCPList {
	newIngressList := &IngressRouteTCPList{
		ListMeta: api.ListMeta{TotalItems: len(IngressRouteTCPs)},
		Items:    make([]IngressRouteTCP, 0),
		Errors:   nonCriticalErrors,
	}

	ingresCells, filteredTotal := dataselect.GenericDataSelectWithFilter(toCells(IngressRouteTCPs), dsQuery)
	IngressRouteTCPs = fromCells(ingresCells)
	newIngressList.ListMeta = api.ListMeta{TotalItems: filteredTotal}

	for _, IngressRouteTCP := range IngressRouteTCPs {
		newIngressList.Items = append(newIngressList.Items, toIngressRouteTCP(&IngressRouteTCP))
	}

	return newIngressList
}
