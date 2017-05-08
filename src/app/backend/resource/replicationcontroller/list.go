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

	heapster "github.com/kubernetes/dashboard/src/app/backend/client"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/event"
	"github.com/kubernetes/dashboard/src/app/backend/resource/metric"
	client "k8s.io/client-go/kubernetes"
	api "k8s.io/client-go/pkg/api/v1"
)

// ReplicationControllerList contains a list of Replication Controllers in the cluster.
type ReplicationControllerList struct {
	ListMeta common.ListMeta `json:"listMeta"`

	// Unordered list of Replication Controllers.
	ReplicationControllers []ReplicationController `json:"replicationControllers"`
	CumulativeMetrics      []metric.Metric         `json:"cumulativeMetrics"`
}

// GetReplicationControllerList returns a list of all Replication Controllers in the cluster.
func GetReplicationControllerList(client *client.Clientset, nsQuery *common.NamespaceQuery,
	dsQuery *dataselect.DataSelectQuery, heapsterClient *heapster.HeapsterClient) (*ReplicationControllerList, error) {
	log.Print("Getting list of all replication controllers in the cluster")

	channels := &common.ResourceChannels{
		ReplicationControllerList: common.GetReplicationControllerListChannel(client, nsQuery, 1),
		PodList:                   common.GetPodListChannel(client, nsQuery, 1),
		EventList:                 common.GetEventListChannel(client, nsQuery, 1),
	}

	return GetReplicationControllerListFromChannels(channels, dsQuery, heapsterClient)
}

// GetReplicationControllerListFromChannels returns a list of all Replication Controllers in the cluster
// reading required resource list once from the channels.
func GetReplicationControllerListFromChannels(channels *common.ResourceChannels,
	dsQuery *dataselect.DataSelectQuery, heapsterClient *heapster.HeapsterClient) (*ReplicationControllerList, error) {

	rcList := <-channels.ReplicationControllerList.List
	if err := <-channels.ReplicationControllerList.Error; err != nil {
		return nil, err
	}

	podList := <-channels.PodList.List
	if err := <-channels.PodList.Error; err != nil {
		return nil, err
	}

	eventList := <-channels.EventList.List
	if err := <-channels.EventList.Error; err != nil {
		return nil, err
	}

	return CreateReplicationControllerList(rcList.Items, dsQuery, podList.Items, eventList.Items, heapsterClient), nil
}

// CreateReplicationControllerList creates paginated list of Replication Controller model
// objects based on Kubernetes Replication Controller objects array and related resources arrays.
func CreateReplicationControllerList(replicationControllers []api.ReplicationController,
	dsQuery *dataselect.DataSelectQuery, pods []api.Pod, events []api.Event, heapsterClient *heapster.HeapsterClient) *ReplicationControllerList {

	rcList := &ReplicationControllerList{
		ReplicationControllers: make([]ReplicationController, 0),
		ListMeta:               common.ListMeta{TotalItems: len(replicationControllers)},
	}
	cachedResources := &dataselect.CachedResources{
		Pods: pods,
	}
	rcCells, metricPromises, filteredTotal := dataselect.GenericDataSelectWithFilterAndMetrics(
		toCells(replicationControllers), dsQuery, cachedResources, heapsterClient)
	replicationControllers = fromCells(rcCells)
	rcList.ListMeta = common.ListMeta{TotalItems: filteredTotal}

	for _, rc := range replicationControllers {
		matchingPods := common.FilterPodsByOwnerReference(rc.Namespace, rc.UID, pods)

		podInfo := common.GetPodInfo(rc.Status.Replicas, *rc.Spec.Replicas, matchingPods)
		podInfo.Warnings = event.GetPodsEventWarnings(events, matchingPods)

		replicationController := ToReplicationController(&rc, &podInfo)
		rcList.ReplicationControllers = append(rcList.ReplicationControllers, replicationController)
	}

	cumulativeMetrics, err := metricPromises.GetMetrics()
	rcList.CumulativeMetrics = cumulativeMetrics
	if err != nil {
		rcList.CumulativeMetrics = make([]metric.Metric, 0)
	}

	return rcList
}
