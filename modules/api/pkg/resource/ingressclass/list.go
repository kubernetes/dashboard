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

package ingressclass

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/errors"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	networkingv1 "k8s.io/api/networking/v1"
	"k8s.io/client-go/kubernetes"
)

// IngressClassList holds a list of Ingress Class objects in the cluster.
type IngressClassList struct {
	ListMeta api.ListMeta   `json:"listMeta"`
	Items    []IngressClass `json:"items"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

// IngressClass is a representation of a Kubernetes Ingress Class object.
type IngressClass struct {
	ObjectMeta api.ObjectMeta `json:"objectMeta"`
	TypeMeta   api.TypeMeta   `json:"typeMeta"`
	Controller string         `json:"controller"`
}

// GetIngressClassList returns a list of all Ingress class objects in the cluster.
func GetIngressClassList(client kubernetes.Interface, dsQuery *dataselect.DataSelectQuery) (
	*IngressClassList, error) {
	log.Print("Getting list of ingress classes in the cluster")

	channels := &common.ResourceChannels{
		IngressClassList: common.GetIngressClassListChannel(client, 1),
	}

	return GetIngressClassListFromChannels(channels, dsQuery)
}

// GetIngressClassListFromChannels returns a list of all ingress class objects in the cluster.
func GetIngressClassListFromChannels(channels *common.ResourceChannels,
	dsQuery *dataselect.DataSelectQuery) (*IngressClassList, error) {
	ingressClasses := <-channels.IngressClassList.List
	err := <-channels.IngressClassList.Error
	nonCriticalErrors, criticalError := errors.HandleError(err)
	if criticalError != nil {
		return nil, criticalError
	}

	return toIngressClassList(ingressClasses.Items, nonCriticalErrors, dsQuery), nil
}

func toIngressClassList(ingressClasses []networkingv1.IngressClass, nonCriticalErrors []error,
	dsQuery *dataselect.DataSelectQuery) *IngressClassList {

	ingressClassList := &IngressClassList{
		Items:    make([]IngressClass, 0),
		ListMeta: api.ListMeta{TotalItems: len(ingressClasses)},
		Errors:   nonCriticalErrors,
	}

	ingressClassCells, filteredTotal := dataselect.GenericDataSelectWithFilter(toCells(ingressClasses), dsQuery)
	ingressClasses = fromCells(ingressClassCells)
	ingressClassList.ListMeta = api.ListMeta{TotalItems: filteredTotal}

	for _, ingressClass := range ingressClasses {
		ingressClassList.Items = append(ingressClassList.Items, toIngressClass(&ingressClass))
	}

	return ingressClassList
}

func toIngressClass(ingressClass *networkingv1.IngressClass) IngressClass {
	return IngressClass{
		ObjectMeta: api.NewObjectMeta(ingressClass.ObjectMeta),
		TypeMeta:   api.NewTypeMeta(api.ResourceKindIngressClass),
		Controller: ingressClass.Spec.Controller,
	}
}
