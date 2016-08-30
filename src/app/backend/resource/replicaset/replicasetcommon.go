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
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/event"
	"github.com/kubernetes/dashboard/src/app/backend/resource/pod"
	"github.com/kubernetes/dashboard/src/app/backend/resource/service"

	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/apis/extensions"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/metric"

	heapster "github.com/kubernetes/dashboard/src/app/backend/client"

)

// CreateReplicaSetList creates paginated list of Replica Set model
// objects based on Kubernetes Replica Set objects array and related resources arrays.
func CreateReplicaSetList(replicaSets []extensions.ReplicaSet, pods []api.Pod,
	events []api.Event, dsQuery *dataselect.DataSelectQuery, heapsterClient *heapster.HeapsterClient) *ReplicaSetList {

	replicaSetList := &ReplicaSetList{
		ReplicaSets: make([]ReplicaSet, 0),
		ListMeta:    common.ListMeta{TotalItems: len(replicaSets)},
	}

	cachedResources := &dataselect.CachedResources{
		Pods: pods,
	}
	replicationControllerCells, metricPromises := dataselect.GenericDataSelectWithMetrics(toCells(replicaSets), dsQuery, cachedResources, heapsterClient)
	replicaSets = fromCells(replicationControllerCells)

	for _, replicaSet := range replicaSets {
		matchingPods := common.FilterNamespacedPodsBySelector(pods, replicaSet.ObjectMeta.Namespace,
			replicaSet.Spec.Selector.MatchLabels)
		podInfo := common.GetPodInfo(replicaSet.Status.Replicas,
			replicaSet.Spec.Replicas, matchingPods)
		podInfo.Warnings = event.GetPodsEventWarnings(events, matchingPods)

		replicaSetList.ReplicaSets = append(replicaSetList.ReplicaSets, ToReplicaSet(&replicaSet, &podInfo))
	}
	cumulativeMetrics, _ := metricPromises.GetMetrics()
	replicaSetList.CumulativeMetrics = cumulativeMetrics
	return replicaSetList
}

// ToReplicaSet converts replica set api object to replica set model object.
func ToReplicaSet(replicaSet *extensions.ReplicaSet, podInfo *common.PodInfo) ReplicaSet {
	return ReplicaSet{
		ObjectMeta:      common.NewObjectMeta(replicaSet.ObjectMeta),
		TypeMeta:        common.NewTypeMeta(common.ResourceKindReplicaSet),
		ContainerImages: common.GetContainerImages(&replicaSet.Spec.Template.Spec),
		Pods:            *podInfo,
	}
}

// ToReplicaSetDetail converts replica set api object to replica set detail model object.
func ToReplicaSetDetail(replicaSet *extensions.ReplicaSet, eventList common.EventList,
	podList pod.PodList, podInfo common.PodInfo, serviceList service.ServiceList) ReplicaSetDetail {

	return ReplicaSetDetail{
		ObjectMeta:      common.NewObjectMeta(replicaSet.ObjectMeta),
		TypeMeta:        common.NewTypeMeta(common.ResourceKindReplicaSet),
		ContainerImages: common.GetContainerImages(&replicaSet.Spec.Template.Spec),
		PodInfo:         podInfo,
		// TODO(floreks): add pagination support
		PodList:     podList,
		ServiceList: serviceList,
		EventList:   eventList,
	}
}

// The code below allows to perform complex data section on []extensions.ReplicaSet

type ReplicaSetCell extensions.ReplicaSet

func (self ReplicaSetCell) GetProperty(name dataselect.PropertyName) dataselect.ComparableValue {
	switch name {
	case dataselect.NameProperty:
		return dataselect.StdComparableString(self.ObjectMeta.Name)
	case dataselect.CreationTimestampProperty:
		return dataselect.StdComparableTime(self.ObjectMeta.CreationTimestamp.Time)
	case dataselect.NamespaceProperty:
		return dataselect.StdComparableString(self.ObjectMeta.Namespace)
	default:
		// if name is not supported then just return a constant dummy value, sort will have no effect.
		return nil
	}
}

func (self ReplicaSetCell) GetResourceSelector() *metric.ResourceSelector {
	return &metric.ResourceSelector{
		Namespace:     self.ObjectMeta.Namespace,
		ResourceType:  common.ResourceKindReplicaSet,
		ResourceName:  self.ObjectMeta.Name,
		LabelSelector: self.Spec.Selector,
	}
}

func toCells(std []extensions.ReplicaSet) []dataselect.DataCell {
	cells := make([]dataselect.DataCell, len(std))
	for i := range std {
		cells[i] = ReplicaSetCell(std[i])
	}
	return cells
}

func fromCells(cells []dataselect.DataCell) []extensions.ReplicaSet {
	std := make([]extensions.ReplicaSet, len(cells))
	for i := range std {
		std[i] = extensions.ReplicaSet(cells[i].(ReplicaSetCell))
	}
	return std
}
