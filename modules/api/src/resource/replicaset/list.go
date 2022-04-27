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

package replicaset

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/errors"
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/event"
	apps "k8s.io/api/apps/v1"
	v1 "k8s.io/api/core/v1"
	client "k8s.io/client-go/kubernetes"
)

// ReplicaSetList contains a list of Replica Sets in the cluster.
type ReplicaSetList struct {
	ListMeta          api.ListMeta       `json:"listMeta"`
	CumulativeMetrics []metricapi.Metric `json:"cumulativeMetrics"`

	// Basic information about resources status on the list.
	Status common.ResourceStatus `json:"status"`

	// Unordered list of Replica Sets.
	ReplicaSets []ReplicaSet `json:"replicaSets"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

// ReplicaSet is a presentation layer view of Kubernetes Replica Set resource.
type ReplicaSet struct {
	ObjectMeta api.ObjectMeta `json:"objectMeta"`
	TypeMeta   api.TypeMeta   `json:"typeMeta"`

	// Aggregate information about pods belonging to this Replica Set.
	Pods common.PodInfo `json:"podInfo"`

	// Container images of the Replica Set.
	ContainerImages []string `json:"containerImages"`

	// Init Container images of the Replica Set.
	InitContainerImages []string `json:"initContainerImages"`
}

// ToReplicaSet converts replica set api object to replica set model object.
func ToReplicaSet(replicaSet *apps.ReplicaSet, podInfo *common.PodInfo) ReplicaSet {
	return ReplicaSet{
		ObjectMeta:          api.NewObjectMeta(replicaSet.ObjectMeta),
		TypeMeta:            api.NewTypeMeta(api.ResourceKindReplicaSet),
		ContainerImages:     common.GetContainerImages(&replicaSet.Spec.Template.Spec),
		InitContainerImages: common.GetInitContainerImages(&replicaSet.Spec.Template.Spec),
		Pods:                *podInfo,
	}
}

// GetReplicaSetList returns a list of all Replica Sets in the cluster.
func GetReplicaSetList(client client.Interface, nsQuery *common.NamespaceQuery,
	dsQuery *dataselect.DataSelectQuery, metricClient metricapi.MetricClient) (*ReplicaSetList, error) {
	log.Print("Getting list of all replica sets in the cluster")

	channels := &common.ResourceChannels{
		ReplicaSetList: common.GetReplicaSetListChannel(client, nsQuery, 1),
		PodList:        common.GetPodListChannel(client, nsQuery, 1),
		EventList:      common.GetEventListChannel(client, nsQuery, 1),
	}

	return GetReplicaSetListFromChannels(channels, dsQuery, metricClient)
}

// GetReplicaSetListFromChannels returns a list of all Replica Sets in the cluster
// reading required resource list once from the channels.
func GetReplicaSetListFromChannels(channels *common.ResourceChannels,
	dsQuery *dataselect.DataSelectQuery, metricClient metricapi.MetricClient) (*ReplicaSetList, error) {

	replicaSets := <-channels.ReplicaSetList.List
	err := <-channels.ReplicaSetList.Error
	nonCriticalErrors, criticalError := errors.HandleError(err)
	if criticalError != nil {
		return nil, criticalError
	}

	pods := <-channels.PodList.List
	err = <-channels.PodList.Error
	nonCriticalErrors, criticalError = errors.AppendError(err, nonCriticalErrors)
	if criticalError != nil {
		return nil, criticalError
	}

	events := <-channels.EventList.List
	err = <-channels.EventList.Error
	nonCriticalErrors, criticalError = errors.AppendError(err, nonCriticalErrors)
	if criticalError != nil {
		return nil, criticalError
	}

	rsList := ToReplicaSetList(replicaSets.Items, pods.Items, events.Items, nonCriticalErrors, dsQuery, metricClient)
	rsList.Status = getStatus(replicaSets, pods.Items, events.Items)
	return rsList, nil
}

// ToReplicaSetList creates paginated list of Replica Set model
// objects based on Kubernetes Replica Set objects array and related resources arrays.
func ToReplicaSetList(replicaSets []apps.ReplicaSet, pods []v1.Pod, events []v1.Event, nonCriticalErrors []error,
	dsQuery *dataselect.DataSelectQuery, metricClient metricapi.MetricClient) *ReplicaSetList {

	replicaSetList := &ReplicaSetList{
		ReplicaSets: make([]ReplicaSet, 0),
		ListMeta:    api.ListMeta{TotalItems: len(replicaSets)},
		Errors:      nonCriticalErrors,
	}

	cachedResources := &metricapi.CachedResources{
		Pods: pods,
	}
	rsCells, metricPromises, filteredTotal := dataselect.
		GenericDataSelectWithFilterAndMetrics(
			ToCells(replicaSets), dsQuery, cachedResources, metricClient)
	replicaSets = FromCells(rsCells)
	replicaSetList.ListMeta = api.ListMeta{TotalItems: filteredTotal}

	for _, replicaSet := range replicaSets {
		matchingPods := common.FilterPodsByControllerRef(&replicaSet, pods)
		podInfo := common.GetPodInfo(replicaSet.Status.Replicas, replicaSet.Spec.Replicas,
			matchingPods)
		podInfo.Warnings = event.GetPodsEventWarnings(events, matchingPods)
		replicaSetList.ReplicaSets = append(replicaSetList.ReplicaSets,
			ToReplicaSet(&replicaSet, &podInfo))
	}

	cumulativeMetrics, err := metricPromises.GetMetrics()
	replicaSetList.CumulativeMetrics = cumulativeMetrics
	if err != nil {
		replicaSetList.CumulativeMetrics = make([]metricapi.Metric, 0)
	}

	return replicaSetList
}
