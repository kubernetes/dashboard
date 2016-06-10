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

	"github.com/kubernetes/dashboard/resource/common"
	"github.com/kubernetes/dashboard/resource/event"

	"k8s.io/kubernetes/pkg/api"
	client "k8s.io/kubernetes/pkg/client/unversioned"
)

// ReplicationControllerList contains a list of Replication Controllers in the cluster.
type ReplicationControllerList struct {
	// Unordered list of Replication Controllers.
	ReplicationControllers []ReplicationController `json:"replicationControllers"`
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
func GetReplicationControllerList(client *client.Client, nsQuery *common.NamespaceQuery) (*ReplicationControllerList, error) {
	log.Printf("Getting list of all replication controllers in the cluster")

	channels := &common.ResourceChannels{
		ReplicationControllerList: common.GetReplicationControllerListChannel(client, nsQuery, 1),
		PodList:                   common.GetPodListChannel(client, nsQuery, 1),
		EventList:                 common.GetEventListChannel(client, nsQuery, 1),
	}

	return GetReplicationControllerListFromChannels(channels)
}

// GetReplicationControllerListFromChannels returns a list of all Replication Controllers in the cluster
// reading required resource list once from the channels.
func GetReplicationControllerListFromChannels(channels *common.ResourceChannels) (
	*ReplicationControllerList, error) {

	replicationControllers := <-channels.ReplicationControllerList.List
	if err := <-channels.ReplicationControllerList.Error; err != nil {
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

	result := getReplicationControllerList(replicationControllers.Items, pods.Items, events.Items)

	return result, nil
}

// Returns a list of all Replication Controller model objects in the cluster, based on all Kubernetes
// Replication Controller and Service API objects.
func getReplicationControllerList(replicationControllers []api.ReplicationController,
	pods []api.Pod, events []api.Event) *ReplicationControllerList {

	replicationControllerList := &ReplicationControllerList{
		ReplicationControllers: make([]ReplicationController, 0),
	}

	for _, replicationController := range replicationControllers {
		matchingPods := make([]api.Pod, 0)
		for _, pod := range pods {
			if pod.ObjectMeta.Namespace == replicationController.ObjectMeta.Namespace &&
				common.IsSelectorMatching(replicationController.Spec.Selector, pod.ObjectMeta.Labels) {
				matchingPods = append(matchingPods, pod)
			}
		}
		podInfo := getReplicationPodInfo(&replicationController, matchingPods)
		podErrors := event.GetPodsEventWarnings(events, matchingPods)

		podInfo.Warnings = podErrors

		replicationControllerList.ReplicationControllers = append(replicationControllerList.ReplicationControllers,
			ReplicationController{
				ObjectMeta:      common.NewObjectMeta(replicationController.ObjectMeta),
				TypeMeta:        common.NewTypeMeta(common.ResourceKindReplicationController),
				Pods:            podInfo,
				ContainerImages: common.GetContainerImages(&replicationController.Spec.Template.Spec),
			})
	}

	return replicationControllerList
}

// Returns all services that target the same Pods (or subset) as the given Replication Controller.
func getMatchingServices(services []api.Service,
	replicationController *api.ReplicationController) []api.Service {

	var matchingServices []api.Service
	for _, service := range services {
		if service.ObjectMeta.Namespace == replicationController.ObjectMeta.Namespace &&
			common.IsSelectorMatching(service.Spec.Selector, replicationController.Spec.Selector) {

			matchingServices = append(matchingServices, service)
		}
	}
	return matchingServices
}
