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

// ToReplicationController converts replication controller api object to replication controller
// model object.
func ToReplicationController(replicationController *api.ReplicationController,
	podInfo *common.PodInfo) ReplicationController {

	return ReplicationController{
		ObjectMeta:      common.NewObjectMeta(replicationController.ObjectMeta),
		TypeMeta:        common.NewTypeMeta(common.ResourceKindReplicationController),
		Pods:            *podInfo,
		ContainerImages: common.GetContainerImages(&replicationController.Spec.Template.Spec),
	}
}

// ToReplicationControllerDetail converts replication controller api object to replication
// controller detail model object.
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

// CreateReplicationControllerList creates paginated list of Replication Controller model
// objects based on Kubernetes Replication Controller objects array and related resources arrays.
func CreateReplicationControllerList(replicationControllers []api.ReplicationController,
	dsQuery *common.DataSelectQuery, pods []api.Pod, events []api.Event) *ReplicationControllerList {

	rcList := &ReplicationControllerList{
		ReplicationControllers: make([]ReplicationController, 0),
		ListMeta:               common.ListMeta{TotalItems: len(replicationControllers)},
	}

	replicationControllers = fromCells(common.GenericDataSelect(toCells(replicationControllers), dsQuery))
 
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


// The code below allows to perform complex data section on []api.ReplicationController

var propertyGetters = map[string]func(ReplicationControllerCell)(common.ComparableValue){
	"name": func(self ReplicationControllerCell)(common.ComparableValue) {return common.StdComparableString(self.ObjectMeta.Name)},
	"creationTimestamp": func(self ReplicationControllerCell)(common.ComparableValue) {return common.StdComparableTime(self.ObjectMeta.CreationTimestamp.Time)},
	"namespace": func(self ReplicationControllerCell)(common.ComparableValue) {return common.StdComparableString(self.ObjectMeta.Namespace)},
}


type ReplicationControllerCell api.ReplicationController

func (self ReplicationControllerCell) GetProperty(name string) common.ComparableValue {
	getter, isGetterPresent := propertyGetters[name]
	if !isGetterPresent {
		// if getter not present then just return a constant dummy value, sort will have no effect.
		return common.StdComparableInt(0)
	}
	return getter(self)
}


func toCells(std []api.ReplicationController) []common.GenericDataCell {
	cells := make([]common.GenericDataCell, len(std))
	for i := range std {
		cells[i] = ReplicationControllerCell(std[i])
	}
	return cells
}

func fromCells(cells []common.GenericDataCell) []api.ReplicationController {
	std := make([]api.ReplicationController, len(cells))
	for i := range std {
		std[i] = api.ReplicationController(cells[i].(ReplicationControllerCell))
	}
	return std
}
