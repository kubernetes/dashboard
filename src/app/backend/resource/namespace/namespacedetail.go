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

package namespace

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/client"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/event"
	"github.com/kubernetes/dashboard/src/app/backend/resource/limitrange"
	"github.com/kubernetes/dashboard/src/app/backend/resource/resourcequota"
	"k8s.io/kubernetes/pkg/api"
	k8sClient "k8s.io/kubernetes/pkg/client/clientset_generated/internalclientset"
	"k8s.io/kubernetes/pkg/fields"
	"k8s.io/kubernetes/pkg/labels"
)

// NamespaceDetail is a presentation layer view of Kubernetes Namespace resource. This means it is Namespace plus
// additional augmented data we can get from other sources.
type NamespaceDetail struct {
	ObjectMeta common.ObjectMeta `json:"objectMeta"`
	TypeMeta   common.TypeMeta   `json:"typeMeta"`

	// NamespacePhase is the current lifecycle phase of the namespace.
	Phase api.NamespacePhase `json:"phase"`

	// Events is list of events associated to the namespace.
	EventList common.EventList `json:"eventList"`

	// ResourceQuotaList is list of resource quotas associated to the namespace
	ResourceQuotaList *resourcequota.ResourceQuotaDetailList `json:"resourceQuotaList"`

	// ResourceLimits is list of limit ranges associated to the namespace
	ResourceLimits []limitrange.LimitRangeItem `json:"resourceLimits"`
}

// GetNamespaceDetail gets namespace details.
func GetNamespaceDetail(client k8sClient.Interface, heapsterClient client.HeapsterClient, name string) (
	*NamespaceDetail, error) {
	log.Printf("Getting details of %s namespace", name)

	namespace, err := client.Core().Namespaces().Get(name)
	if err != nil {
		return nil, err
	}

	events, err := event.GetNamespaceEvents(client, dataselect.DefaultDataSelect, namespace.Name)
	if err != nil {
		return nil, err
	}

	resourceQuotaList, err := getResourceQuotas(client, *namespace)
	if err != nil {
		return nil, err
	}

	resourceLimits, err := getLimitRanges(client, *namespace)
	if err != nil {
		return nil, err
	}

	namespaceDetails := toNamespaceDetail(*namespace, events, resourceQuotaList, resourceLimits)

	return &namespaceDetails, nil
}

func toNamespaceDetail(namespace api.Namespace, events common.EventList, resourceQuotaList *resourcequota.ResourceQuotaDetailList, resourceLimits []limitrange.LimitRangeItem) NamespaceDetail {

	return NamespaceDetail{
		ObjectMeta:        common.NewObjectMeta(namespace.ObjectMeta),
		TypeMeta:          common.NewTypeMeta(common.ResourceKindNamespace),
		Phase:             namespace.Status.Phase,
		EventList:         events,
		ResourceQuotaList: resourceQuotaList,
		ResourceLimits:    resourceLimits,
	}
}

var listEverything = api.ListOptions{
	LabelSelector: labels.Everything(),
	FieldSelector: fields.Everything(),
}

func getResourceQuotas(client k8sClient.Interface, namespace api.Namespace) (*resourcequota.ResourceQuotaDetailList, error) {
	list, err := client.Core().ResourceQuotas(namespace.Name).List(listEverything)

	result := &resourcequota.ResourceQuotaDetailList{
		Items:    make([]resourcequota.ResourceQuotaDetail, 0),
		ListMeta: common.ListMeta{TotalItems: len(list.Items)},
	}

	for _, item := range list.Items {
		detail := resourcequota.ToResourceQuotaDetail(&item)
		result.Items = append(result.Items, *detail)
	}

	return result, err
}

func getLimitRanges(client k8sClient.Interface, namespace api.Namespace) ([]limitrange.LimitRangeItem, error) {
	list, err := client.Core().LimitRanges(namespace.Name).List(listEverything)

	if err != nil {
		return nil, err
	}

	resourceLimits := make([]limitrange.LimitRangeItem, 0)
	for _, item := range list.Items {
		list := limitrange.ToLimitRanges(&item)
		resourceLimits = append(resourceLimits, list...)
	}

	return resourceLimits, nil
}
