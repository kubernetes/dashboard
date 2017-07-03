// Copyright 2017 The Kubernetes Dashboard Authors.
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
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/event"
	client "k8s.io/client-go/kubernetes"
	"k8s.io/client-go/pkg/api/v1"
	extensions "k8s.io/client-go/pkg/apis/extensions/v1beta1"
)

// ReplicaSetList contains a list of Replica Sets in the cluster.
type ReplicaSetList struct {
	ListMeta api.ListMeta `json:"listMeta"`

	// Unordered list of Replica Sets.
	ReplicaSets       []ReplicaSet       `json:"replicaSets"`
	CumulativeMetrics []metricapi.Metric `json:"cumulativeMetrics"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
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
	if err := <-channels.ReplicaSetList.Error; err != nil {
		return nil, err
	}

	pods := <-channels.PodList.List
	if err := <-channels.PodList.Error; err != nil {
		return nil, err
	}

	events := <-channels.EventList.List
	if err := <-channels.EventList.Error; err != nil {
		return nil, err
	}
	return CreateReplicaSetList(replicaSets.Items, pods.Items, events.Items, dsQuery, metricClient), nil
}

// CreateReplicaSetList creates paginated list of Replica Set model
// objects based on Kubernetes Replica Set objects array and related resources arrays.
func CreateReplicaSetList(replicaSets []extensions.ReplicaSet, pods []v1.Pod, events []v1.Event,
	dsQuery *dataselect.DataSelectQuery, metricClient metricapi.MetricClient) *ReplicaSetList {

	replicaSetList := &ReplicaSetList{
		ReplicaSets: make([]ReplicaSet, 0),
		ListMeta:    api.ListMeta{TotalItems: len(replicaSets)},
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
		matchingPods := common.FilterPodsByOwnerReference(replicaSet.Namespace,
			replicaSet.UID, pods)
		podInfo := common.GetPodInfo(replicaSet.Status.Replicas, *replicaSet.Spec.Replicas,
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
