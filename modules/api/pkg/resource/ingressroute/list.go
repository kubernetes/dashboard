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

package ingressroute

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

type IngressRoute struct {
	api.ObjectMeta `json:"objectMeta"`
	api.TypeMeta   `json:"typeMeta"`

	// Host of this ingress route.
	Entrypoints []string `json:"entrypoints"`
	Hosts       []string `json:"hosts"`
	Service     []traefikv1.Service `json:"service"`
}


type IngressRouteList struct {
	api.ListMeta `json:"listMeta"`

	// Unordered list of Ingressroutes.
	Items []IngressRoute `json:"items"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

// GetIngressList returns all ingresses in the given namespace.
func GetIngressRouteList(client client.Interface, namespace *common.NamespaceQuery,
	dsQuery *dataselect.DataSelectQuery, config *rest.Config) (*IngressRouteList, error) {
	// creates the clientset
	traefikclient, err := traefik.NewForConfig(config)
	if err != nil {
		panic(err.Error())
	}
	ingressList, err := traefikclient.TraefikV1alpha1().IngressRoutes("").List(context.TODO(), metav1.ListOptions{})
	nonCriticalErrors, criticalError := errors.HandleError(err)
	if criticalError != nil {
		return nil, criticalError
	}

	return ToIngressRouteList(ingressList.Items, nonCriticalErrors, dsQuery), nil
}

func getHosts(ingress *traefikv1.IngressRoute) []string {
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

func getEntrypoints(ingress *traefikv1.IngressRoute) []string {
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

func getService(ingress *traefikv1.IngressRoute) []traefikv1.Service {
	service := make([]traefikv1.Service, 0)

	for _, route := range ingress.Spec.Routes {
		service = append(service, route.Services...)

	}

	return service
}

func toIngressRoute(ingress *traefikv1.IngressRoute) IngressRoute {
	return IngressRoute{
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

func ToIngressRouteList(ingressroutes []traefikv1.IngressRoute, nonCriticalErrors []error, dsQuery *dataselect.DataSelectQuery) *IngressRouteList {
	newIngressList := &IngressRouteList{
		ListMeta: api.ListMeta{TotalItems: len(ingressroutes)},
		Items:    make([]IngressRoute, 0),
		Errors:   nonCriticalErrors,
	}

	ingresCells, filteredTotal := dataselect.GenericDataSelectWithFilter(toCells(ingressroutes), dsQuery)
	ingressroutes = fromCells(ingresCells)
	newIngressList.ListMeta = api.ListMeta{TotalItems: filteredTotal}

	for _, ingressRoute := range ingressroutes {
		newIngressList.Items = append(newIngressList.Items, toIngressRoute(&ingressRoute))
	}

	return newIngressList
}

// func ToIngressList(ingresses []traefikv1.IngressRoute, nonCriticalErrors []error, dsQuery *dataselect.DataSelectQuery) *IngressList {
// 	newIngressList := &IngressRouteList{
// 		ListMeta: api.ListMeta{TotalItems: len(ingresses)},
// 		Items:    make([]IngressRoute, 0),
// 		Errors:   nonCriticalErrors,
// 	}

// 	ingresCells, filteredTotal := dataselect.GenericDataSelectWithFilter(toCells(ingresses), dsQuery)
// 	ingresses = fromCells(ingresCells)
// 	newIngressList.ListMeta = api.ListMeta{TotalItems: filteredTotal}

// 	for _, ingress := range ingresses {
// 		newIngressList.Items = append(newIngressList.Items, toIngress(&ingress))
// 	}

// 	return newIngressList
// }
