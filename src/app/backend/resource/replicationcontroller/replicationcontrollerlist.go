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

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	client "k8s.io/kubernetes/pkg/client/unversioned"
	heapster "github.com/kubernetes/dashboard/src/app/backend/client"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/metric"
)

// ReplicationControllerList contains a list of Replication Controllers in the cluster.
type ReplicationControllerList struct {
	ListMeta common.ListMeta `json:"listMeta"`

	// Unordered list of Replication Controllers.
	ReplicationControllers []ReplicationController `json:"replicationControllers"`
	CumulativeMetrics []metric.Metric `json:"cumulativeMetrics"`
}

// ReplicationController (aka. Replication Controller) plus zero or more Kubernetes services that
// target the Replication Controller.
type ReplicationController struct {
	ObjectMeta common.ObjectMeta `json:"objectMeta"`
	TypeMeta   common.TypeMeta   `json:"typeMeta"`

	// Aggregate information about pods belonging to this Replication Controller.
	Pods common.PodInfo `json:"pods"`

	// Container images of the Replication Controller.
	ContainerImages []string `json:"containerImages"`
}

// GetReplicationControllerList returns a list of all Replication Controllers in the cluster.
func GetReplicationControllerList(client *client.Client, nsQuery *common.NamespaceQuery,
	dsQuery *dataselect.DataSelectQuery, heapsterClient *heapster.HeapsterClient) (*ReplicationControllerList, error) {
	log.Printf("Getting list of all replication controllers in the cluster")

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
