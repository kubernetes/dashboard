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

package replicationcontroller

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
	api "k8s.io/client-go/pkg/api/v1"
)

// ReplicationControllerDetail represents detailed information about a Replication Controller.
type ReplicationControllerDetail struct {
	ObjectMeta common.ObjectMeta `json:"objectMeta"`
	TypeMeta   common.TypeMeta   `json:"typeMeta"`

	// Label selector of the Replication Controller.
	LabelSelector map[string]string `json:"labelSelector"`

	// Container image list of the pod template specified by this Replication Controller.
	ContainerImages []string `json:"containerImages"`

	// Aggregate information about pods of this replication controller.
	PodInfo common.PodInfo `json:"podInfo"`

	// Detailed information about Pods belonging to this Replication Controller.
	PodList pod.PodList `json:"podList"`

	// Detailed information about service related to Replication Controller.
	ServiceList resourceService.ServiceList `json:"serviceList"`

	// List of events related to this Replication Controller.
	EventList common.EventList `json:"eventList"`

	// True when the data contains at least one pod with metrics information, false otherwise.
	HasMetrics bool `json:"hasMetrics"`

	// List of Horizontal Pod AutoScalers targeting this Replication Controller.
	HorizontalPodAutoscalerList horizontalpodautoscaler.HorizontalPodAutoscalerList `json:"horizontalPodAutoscalerList"`
}

// ReplicationControllerSpec contains information needed to update replication controller.
type ReplicationControllerSpec struct {
	// Replicas (pods) number in replicas set
	Replicas int32 `json:"replicas"`
}

// GetReplicationControllerDetail returns detailed information about the given replication
// controller in the given namespace.
func GetReplicationControllerDetail(client k8sClient.Interface, heapsterClient client.HeapsterClient,
	namespace, name string) (*ReplicationControllerDetail, error) {
	log.Printf("Getting details of %s replication controller in %s namespace", name, namespace)

	replicationController, err := client.CoreV1().ReplicationControllers(namespace).Get(name, metaV1.GetOptions{})
	if err != nil {
		return nil, err
	}

	podInfo, err := getReplicationControllerPodInfo(client, replicationController, namespace)
	if err != nil {
		return nil, err
	}

	podList, err := GetReplicationControllerPods(client, heapsterClient, dataselect.DefaultDataSelectWithMetrics,
		name, namespace)
	if err != nil {
		return nil, err
	}

	eventList, err := GetReplicationControllerEvents(client, dataselect.DefaultDataSelect, namespace, name)
	if err != nil {
		return nil, err
	}

	serviceList, err := GetReplicationControllerServices(client, dataselect.DefaultDataSelect, namespace,
		name)
	if err != nil {
		return nil, err
	}

	hpas, err := horizontalpodautoscaler.GetHorizontalPodAutoscalerListForResource(client, namespace, "ReplicationController", name)
	if err != nil {
		return nil, err
	}

	replicationControllerDetail := ToReplicationControllerDetail(replicationController, *podInfo,
		*podList, *eventList, *serviceList, *hpas)
	return &replicationControllerDetail, nil
}

// UpdateReplicasCount updates number of replicas in Replication Controller based on Replication
// Controller Spec
func UpdateReplicasCount(client k8sClient.Interface, namespace, name string,
	replicationControllerSpec *ReplicationControllerSpec) error {
	log.Printf("Updating replicas count to %d for %s replication controller from %s namespace",
		replicationControllerSpec.Replicas, name, namespace)

	replicationController, err := client.CoreV1().ReplicationControllers(namespace).Get(name, metaV1.GetOptions{})
	if err != nil {
		return err
	}

	replicationController.Spec.Replicas = &replicationControllerSpec.Replicas

	_, err = client.Core().ReplicationControllers(namespace).Update(replicationController)
	if err != nil {
		return err
	}

	log.Printf("Successfully updated replicas count to %d for %s replication controller from %s namespace",
		replicationControllerSpec.Replicas, name, namespace)

	return nil
}

// ToReplicationControllerDetail converts replication controller api object to replication
// controller detail model object.
func ToReplicationControllerDetail(replicationController *api.ReplicationController,
	podInfo common.PodInfo, podList pod.PodList, eventList common.EventList,
	serviceList resourceService.ServiceList, hpas horizontalpodautoscaler.HorizontalPodAutoscalerList) ReplicationControllerDetail {

	replicationControllerDetail := ReplicationControllerDetail{
		ObjectMeta:                  common.NewObjectMeta(replicationController.ObjectMeta),
		TypeMeta:                    common.NewTypeMeta(common.ResourceKindReplicationController),
		LabelSelector:               replicationController.Spec.Selector,
		PodInfo:                     podInfo,
		PodList:                     podList,
		EventList:                   eventList,
		ServiceList:                 serviceList,
		HorizontalPodAutoscalerList: hpas,
		ContainerImages:             common.GetContainerImages(&replicationController.Spec.Template.Spec),
	}

	return replicationControllerDetail
}
