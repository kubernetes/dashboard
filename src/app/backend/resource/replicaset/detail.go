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

package replicaset

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/client"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/horizontalpodautoscaler"
	"github.com/kubernetes/dashboard/src/app/backend/resource/pod"
	resourceService "github.com/kubernetes/dashboard/src/app/backend/resource/service"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	k8sClient "k8s.io/client-go/kubernetes"
	extensions "k8s.io/client-go/pkg/apis/extensions/v1beta1"
)

// ReplicaSetDetail is a presentation layer view of Kubernetes Replica Set resource. This means
// it is Replica Set plus additional augmented data we can get from other sources
// (like services that target the same pods).
type ReplicaSetDetail struct {
	ObjectMeta common.ObjectMeta `json:"objectMeta"`
	TypeMeta   common.TypeMeta   `json:"typeMeta"`

	// Aggregate information about pods belonging to this Replica Set.
	PodInfo common.PodInfo `json:"podInfo"`

	// Detailed information about Pods belonging to this Replica Set.
	PodList pod.PodList `json:"podList"`

	// Detailed information about service related to Replica Set.
	ServiceList resourceService.ServiceList `json:"serviceList"`

	// Container images of the Replica Set.
	ContainerImages []string `json:"containerImages"`

	// List of events related to this Replica Set.
	EventList common.EventList `json:"eventList"`

	// Selector of this replica set.
	Selector *metaV1.LabelSelector `json:"selector"`

	// List of Horizontal Pod Autoscalers targeting this Replica Set.
	HorizontalPodAutoscalerList horizontalpodautoscaler.HorizontalPodAutoscalerList `json:"horizontalPodAutoscalerList"`
}

// GetReplicaSetDetail gets replica set details.
func GetReplicaSetDetail(client k8sClient.Interface, heapsterClient client.HeapsterClient,
	namespace, name string) (*ReplicaSetDetail, error) {
	log.Printf("Getting details of %s service in %s namespace", name, namespace)

	// TODO(floreks): Use channels.
	replicaSetData, err := client.ExtensionsV1beta1().ReplicaSets(namespace).Get(name, metaV1.GetOptions{})
	if err != nil {
		return nil, err
	}

	eventList, err := GetReplicaSetEvents(client, dataselect.DefaultDataSelect, replicaSetData.Namespace, replicaSetData.Name)
	if err != nil {
		return nil, err
	}

	podList, err := GetReplicaSetPods(client, heapsterClient, dataselect.DefaultDataSelectWithMetrics, name, namespace)
	if err != nil {
		return nil, err
	}

	podInfo, err := getReplicaSetPodInfo(client, replicaSetData)
	if err != nil {
		return nil, err
	}

	serviceList, err := GetReplicaSetServices(client, dataselect.DefaultDataSelect, namespace, name)
	if err != nil {
		return nil, err
	}

	hpas, err := horizontalpodautoscaler.GetHorizontalPodAutoscalerListForResource(client, namespace, "ReplicaSet", name)
	if err != nil {
		return nil, err
	}

	replicaSet := ToReplicaSetDetail(replicaSetData, *eventList, *podList, *podInfo, *serviceList, *hpas)
	return &replicaSet, nil
}

// ToReplicaSetDetail converts replica set api object to replica set detail model object.
func ToReplicaSetDetail(replicaSet *extensions.ReplicaSet, eventList common.EventList,
	podList pod.PodList, podInfo common.PodInfo, serviceList resourceService.ServiceList, hpas horizontalpodautoscaler.HorizontalPodAutoscalerList) ReplicaSetDetail {

	return ReplicaSetDetail{
		ObjectMeta:                  common.NewObjectMeta(replicaSet.ObjectMeta),
		TypeMeta:                    common.NewTypeMeta(common.ResourceKindReplicaSet),
		ContainerImages:             common.GetContainerImages(&replicaSet.Spec.Template.Spec),
		Selector:                    replicaSet.Spec.Selector,
		PodInfo:                     podInfo,
		PodList:                     podList,
		ServiceList:                 serviceList,
		EventList:                   eventList,
		HorizontalPodAutoscalerList: hpas,
	}
}
