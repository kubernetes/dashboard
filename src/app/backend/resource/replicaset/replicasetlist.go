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

	"github.com/kubernetes/dashboard/resource/common"
	"github.com/kubernetes/dashboard/resource/replicationcontroller"
	"k8s.io/kubernetes/pkg/api"
	k8serrors "k8s.io/kubernetes/pkg/api/errors"
	"k8s.io/kubernetes/pkg/apis/extensions"
	client "k8s.io/kubernetes/pkg/client/unversioned"
)

// ReplicationSetList contains a list of Replica Sets in the cluster.
type ReplicaSetList struct {
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
func GetReplicaSetList(client client.Interface) (*ReplicaSetList, error) {
	log.Printf("Getting list of all replica sets in the cluster")

	channels := &common.ResourceChannels{
		ReplicaSetList: common.GetReplicaSetListChannel(client.Extensions(), 1),
		ServiceList:    common.GetServiceListChannel(client, 1),
		PodList:        common.GetPodListChannel(client, 1),
		EventList:      common.GetEventListChannel(client, 1),
		NodeList:       common.GetNodeListChannel(client, 1),
	}

	return GetReplicaSetListFromChannels(channels)
}

// GetReplicaSetList returns a list of all Replica Sets in the cluster
// reading required resource list once from the channels.
func GetReplicaSetListFromChannels(channels *common.ResourceChannels) (
	*ReplicaSetList, error) {

	replicaSets := <-channels.ReplicaSetList.List
	if err := <-channels.ReplicaSetList.Error; err != nil {
		statusErr, ok := err.(*k8serrors.StatusError)
		if ok && statusErr.ErrStatus.Reason == "NotFound" {
			// NotFound - this means that the server does not support Replica Set objects, which
			// is fine.
			return nil, nil
		}
		return nil, err
	}

	services := <-channels.ServiceList.List
	if err := <-channels.ServiceList.Error; err != nil {
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

	nodes := <-channels.NodeList.List
	if err := <-channels.NodeList.Error; err != nil {
		return nil, err
	}

	return getReplicaSetList(replicaSets.Items, services.Items, pods.Items, events.Items,
		nodes.Items), nil
}

func getReplicaSetList(replicaSets []extensions.ReplicaSet,
	services []api.Service, pods []api.Pod, events []api.Event,
	nodes []api.Node) *ReplicaSetList {

	replicaSetList := &ReplicaSetList{
		ReplicaSets: make([]ReplicaSet, 0),
	}

	for _, replicaSet := range replicaSets {

		matchingPods := common.GetMatchingPods(replicaSet.Spec.Selector,
			replicaSet.ObjectMeta.Namespace, pods)
		podInfo := getPodInfo(&replicaSet, matchingPods)

		replicaSetList.ReplicaSets = append(replicaSetList.ReplicaSets,
			ReplicaSet{
				ObjectMeta:      common.CreateObjectMeta(replicaSet.ObjectMeta),
				TypeMeta:        common.CreateTypeMeta(replicaSet.TypeMeta),
				ContainerImages: replicationcontroller.GetContainerImages(&replicaSet.Spec.Template.Spec),
				Pods:            podInfo,
			})
	}

	return replicaSetList
}
