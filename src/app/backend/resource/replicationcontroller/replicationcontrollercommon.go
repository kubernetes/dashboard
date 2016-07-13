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
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/event"
	"github.com/kubernetes/dashboard/src/app/backend/resource/pod"
	resourceService "github.com/kubernetes/dashboard/src/app/backend/resource/service"

	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/api/unversioned"
	client "k8s.io/kubernetes/pkg/client/unversioned"
	"k8s.io/kubernetes/pkg/fields"
	"k8s.io/kubernetes/pkg/labels"
)

// Transforms simple selector map to labels.Selector object that can be used when querying for
// object.
func toLabelSelector(selector map[string]string) (labels.Selector, error) {
	labelSelector, err := unversioned.LabelSelectorAsSelector(&unversioned.LabelSelector{MatchLabels: selector})

	if err != nil {
		return nil, err
	}

	return labelSelector, nil
}

// Based on given selector returns list of services that are candidates for deletion.
// Services are matched by replication controllers' label selector. They are deleted if given
// label selector is targeting only 1 replication controller.
func getServicesForDeletion(client client.Interface, labelSelector labels.Selector,
	namespace string) ([]api.Service, error) {

	replicationControllers, err := client.ReplicationControllers(namespace).List(api.ListOptions{
		LabelSelector: labelSelector,
		FieldSelector: fields.Everything(),
	})
	if err != nil {
		return nil, err
	}

	// if label selector is targeting only 1 replication controller
	// then we can delete services targeted by this label selector,
	// otherwise we can not delete any services so just return empty list
	if len(replicationControllers.Items) != 1 {
		return []api.Service{}, nil
	}

	services, err := client.Services(namespace).List(api.ListOptions{
		LabelSelector: labelSelector,
		FieldSelector: fields.Everything(),
	})
	if err != nil {
		return nil, err
	}

	return services.Items, nil
}

// TODO add doc
func ToReplicationController(replicationController *api.ReplicationController,
	podInfo *common.PodInfo) ReplicationController {

	return ReplicationController{
		ObjectMeta:      common.NewObjectMeta(replicationController.ObjectMeta),
		TypeMeta:        common.NewTypeMeta(common.ResourceKindReplicationController),
		Pods:            *podInfo,
		ContainerImages: common.GetContainerImages(&replicationController.Spec.Template.Spec),
	}
}

// TODO add doc
func ToReplicationControllerDetail(replicationController *api.ReplicationController,
	podInfo common.PodInfo, podList pod.PodList, eventList common.EventList,
	serviceList resourceService.ServiceList) ReplicationControllerDetail {

	replicationControllerDetail := ReplicationControllerDetail{
		ObjectMeta:      common.NewObjectMeta(replicationController.ObjectMeta),
		TypeMeta:        common.NewTypeMeta(common.ResourceKindReplicationController),
		LabelSelector:   replicationController.Spec.Selector,
		PodInfo:         podInfo,
		PodList:         podList,
		EventList:       eventList,
		ServiceList:     serviceList,
		ContainerImages: common.GetContainerImages(&replicationController.Spec.Template.Spec),
	}

	return replicationControllerDetail
}

// CreateReplicationControllerList creates a list of all Replication Controller model objects in
// the cluster, based on all Kubernetes Replication Controller and Service API objects.
func CreateReplicationControllerList(replicationControllers []api.ReplicationController,
	pQuery *common.PaginationQuery, pods []api.Pod, events []api.Event) *ReplicationControllerList {

	rcList := &ReplicationControllerList{
		ReplicationControllers: make([]ReplicationController, 0),
		ListMeta:               common.ListMeta{TotalItems: len(replicationControllers)},
	}

	// TODO support pagination

	for _, rc := range replicationControllers {
		matchingPods := common.FilterNamespacedPodsBySelector(pods, rc.ObjectMeta.Namespace,
			rc.Spec.Selector)
		podInfo := common.GetPodInfo(rc.Status.Replicas, rc.Spec.Replicas, matchingPods)
		podInfo.Warnings = event.GetPodsEventWarnings(events, matchingPods)

		replicationController := ToReplicationController(&rc, &podInfo)
		rcList.ReplicationControllers = append(rcList.ReplicationControllers, replicationController)
	}

	return rcList
}
