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

	heapster "github.com/kubernetes/dashboard/src/app/backend/client"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/event"
	"github.com/kubernetes/dashboard/src/app/backend/resource/metric"
	k8serrors "k8s.io/apimachinery/pkg/api/errors"
	client "k8s.io/client-go/kubernetes"
	api "k8s.io/client-go/pkg/api/v1"
	extensions "k8s.io/client-go/pkg/apis/extensions/v1beta1"
)

// ReplicaSetList contains a list of Replica Sets in the cluster.
type ReplicaSetList struct {
	ListMeta common.ListMeta `json:"listMeta"`

	// Unordered list of Replica Sets.
	ReplicaSets       []ReplicaSet    `json:"replicaSets"`
	CumulativeMetrics []metric.Metric `json:"cumulativeMetrics"`
}

// GetReplicaSetList returns a list of all Replica Sets in the cluster.
func GetReplicaSetList(client client.Interface, nsQuery *common.NamespaceQuery,
	dsQuery *dataselect.DataSelectQuery, heapsterClient *heapster.HeapsterClient) (*ReplicaSetList, error) {
	log.Print("Getting list of all replica sets in the cluster")

	channels := &common.ResourceChannels{
		ReplicaSetList: common.GetReplicaSetListChannel(client, nsQuery, 1),
		PodList:        common.GetPodListChannel(client, nsQuery, 1),
		EventList:      common.GetEventListChannel(client, nsQuery, 1),
	}

	return GetReplicaSetListFromChannels(channels, dsQuery, heapsterClient)
}

// GetReplicaSetListFromChannels returns a list of all Replica Sets in the cluster
// reading required resource list once from the channels.
func GetReplicaSetListFromChannels(channels *common.ResourceChannels,
	dsQuery *dataselect.DataSelectQuery, heapsterClient *heapster.HeapsterClient) (*ReplicaSetList, error) {

	replicaSets := <-channels.ReplicaSetList.List
	if err := <-channels.ReplicaSetList.Error; err != nil {
		statusErr, ok := err.(*k8serrors.StatusError)
		if ok && statusErr.ErrStatus.Reason == "NotFound" {
			// NotFound - this means that the server does not support Replica Set objects, which
			// is fine.
			emptyList := &ReplicaSetList{
				ReplicaSets: make([]ReplicaSet, 0),
			}
			return emptyList, nil
		}
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
	return CreateReplicaSetList(replicaSets.Items, pods.Items, events.Items, dsQuery, heapsterClient), nil
}

// CreateReplicaSetList creates paginated list of Replica Set model
// objects based on Kubernetes Replica Set objects array and related resources arrays.
func CreateReplicaSetList(replicaSets []extensions.ReplicaSet, pods []api.Pod, events []api.Event,
	dsQuery *dataselect.DataSelectQuery, heapsterClient *heapster.HeapsterClient) *ReplicaSetList {

	replicaSetList := &ReplicaSetList{
		ReplicaSets: make([]ReplicaSet, 0),
		ListMeta:    common.ListMeta{TotalItems: len(replicaSets)},
	}

	cachedResources := &dataselect.CachedResources{
		Pods: pods,
	}
	rsCells, metricPromises, filteredTotal := dataselect.GenericDataSelectWithFilterAndMetrics(ToCells(replicaSets), dsQuery, cachedResources, heapsterClient)
	replicaSets = FromCells(rsCells)
	replicaSetList.ListMeta = common.ListMeta{TotalItems: filteredTotal}

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
		replicaSetList.CumulativeMetrics = make([]metric.Metric, 0)
	}

	return replicaSetList
}
