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
)

// CreateReplicaSetList creates paginated list of Replica Set model
// objects based on Kubernetes Replica Set objects array and related resources arrays.
func CreateReplicaSetList(replicaSets []extensions.ReplicaSet, pods []api.Pod,
	events []api.Event, pQuery *common.PaginationQuery) *ReplicaSetList {

	replicaSetList := &ReplicaSetList{
		ReplicaSets: make([]ReplicaSet, 0),
		ListMeta:    common.ListMeta{TotalItems: len(replicaSets)},
	}

	replicaSets = paginate(replicaSets, pQuery)

	for _, replicaSet := range replicaSets {
		matchingPods := common.FilterNamespacedPodsBySelector(pods, replicaSet.ObjectMeta.Namespace,
			replicaSet.Spec.Selector.MatchLabels)
		podInfo := common.GetPodInfo(replicaSet.Status.Replicas,
			replicaSet.Spec.Replicas, matchingPods)
		podInfo.Warnings = event.GetPodsEventWarnings(events, matchingPods)

		replicaSetList.ReplicaSets = append(replicaSetList.ReplicaSets, ToReplicaSet(&replicaSet, &podInfo))
	}

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

func paginate(replicaSets []extensions.ReplicaSet,
	pQuery *common.PaginationQuery) []extensions.ReplicaSet {

	startIndex, endIndex := pQuery.GetPaginationSettings(len(replicaSets))

	// Return all items if provided settings do not meet requirements
	if !pQuery.CanPaginate(len(replicaSets), startIndex) {
		return replicaSets
	}

	return replicaSets[startIndex:endIndex]
}
