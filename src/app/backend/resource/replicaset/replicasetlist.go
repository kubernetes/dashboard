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

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"

	k8serrors "k8s.io/kubernetes/pkg/api/errors"
	client "k8s.io/kubernetes/pkg/client/unversioned"
)

// ReplicationSetList contains a list of Replica Sets in the cluster.
type ReplicaSetList struct {
	ListMeta common.ListMeta `json:"listMeta"`

	// Unordered list of Replica Sets.
	ReplicaSets []ReplicaSet `json:"replicaSets"`
}

// ReplicaSet is a presentation layer view of Kubernetes Replica Set resource. This means
// it is Replica Set plus additional augumented data we can get from other sources
// (like services that target the same pods).
type ReplicaSet struct {
	ObjectMeta common.ObjectMeta `json:"objectMeta"`
	TypeMeta   common.TypeMeta   `json:"typeMeta"`

	// Aggregate information about pods belonging to this Replica Set.
	Pods common.PodInfo `json:"pods"`

	// Container images of the Replica Set.
	ContainerImages []string `json:"containerImages"`
}

// GetReplicaSetList returns a list of all Replica Sets in the cluster.
func GetReplicaSetList(client client.Interface, nsQuery *common.NamespaceQuery,
	dsQuery *common.DataSelectQuery) (*ReplicaSetList, error) {
	log.Printf("Getting list of all replica sets in the cluster")

	channels := &common.ResourceChannels{
		ReplicaSetList: common.GetReplicaSetListChannel(client.Extensions(), nsQuery, 1),
		PodList:        common.GetPodListChannel(client, nsQuery, 1),
		EventList:      common.GetEventListChannel(client, nsQuery, 1),
	}

	return GetReplicaSetListFromChannels(channels, dsQuery)
}

// GetReplicaSetList returns a list of all Replica Sets in the cluster
// reading required resource list once from the channels.
func GetReplicaSetListFromChannels(channels *common.ResourceChannels,
	dsQuery *common.DataSelectQuery) (*ReplicaSetList, error) {

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

	return CreateReplicaSetList(replicaSets.Items, pods.Items, events.Items, dsQuery), nil
}
