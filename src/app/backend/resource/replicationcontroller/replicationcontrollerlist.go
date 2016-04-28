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
	// TODO(maciaszczykm): Avoid using dot-imports.
	. "github.com/kubernetes/dashboard/resource/event"
	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/api/unversioned"
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
	// Name of the Replication Controller.
	Name string `json:"name"`

	// Namespace this Replication Controller is in.
	Namespace string `json:"namespace"`

	// Human readable description of this Replication Controller.
	Description string `json:"description"`

	// Label of this Replication Controller.
	Labels map[string]string `json:"labels"`

	// Aggregate information about pods belonging to this Replication Controller.
	Pods common.ControllerPodInfo `json:"pods"`

	// Container images of the Replication Controller.
	ContainerImages []string `json:"containerImages"`

	// Time the replication controller was created.
	CreationTime unversioned.Time `json:"creationTime"`

	// Internal endpoints of all Kubernetes services have the same label selector as this Replication Controller.
	InternalEndpoints []Endpoint `json:"internalEndpoints"`

	// External endpoints of all Kubernetes services have the same label selector as this Replication Controller.
	ExternalEndpoints []Endpoint `json:"externalEndpoints"`
}

// GetReplicationControllerList returns a list of all Replication Controllers in the cluster.
func GetReplicationControllerList(client *client.Client) (*ReplicationControllerList, error) {
	log.Printf("Getting list of all replication controllers in the cluster")

	channels := &common.ResourceChannels{
		ReplicationControllerList: common.GetReplicationControllerListChannel(client, 1),
		ServiceList:               common.GetServiceListChannel(client, 1),
		PodList:                   common.GetPodListChannel(client, 1),
		EventList:                 common.GetEventListChannel(client, 1),
		NodeList:                  common.GetNodeListChannel(client, 1),
	}

	return GetReplicationControllerListFromChannels(channels)
}

// GetReplicationControllerList returns a list of all Replication Controllers in the cluster
// reading required resource list once from the channels.
func GetReplicationControllerListFromChannels(channels *common.ResourceChannels) (
	*ReplicationControllerList, error) {

	replicationControllers := <-channels.ReplicationControllerList.List
	if err := <-channels.ReplicationControllerList.Error; err != nil {
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

	result := getReplicationControllerList(replicationControllers.Items, services.Items,
		pods.Items, events.Items, nodes.Items)

	return result, nil
}

// Returns a list of all Replication Controller model objects in the cluster, based on all Kubernetes
// Replication Controller and Service API objects.
// The function processes all Replication Controllers API objects and finds matching Services for them.
func getReplicationControllerList(replicationControllers []api.ReplicationController,
	services []api.Service, pods []api.Pod, events []api.Event,
	nodes []api.Node) *ReplicationControllerList {

	replicationControllerList := &ReplicationControllerList{
		ReplicationControllers: make([]ReplicationController, 0),
	}

	for _, replicationController := range replicationControllers {

		matchingServices := getMatchingServices(services, &replicationController)
		var internalEndpoints []Endpoint
		var externalEndpoints []Endpoint
		for _, service := range matchingServices {
			internalEndpoints = append(internalEndpoints,
				getInternalEndpoint(service.Name, service.Namespace, service.Spec.Ports))
			externalEndpoints = getExternalEndpoints(replicationController, pods, service, nodes)
		}

		matchingPods := make([]api.Pod, 0)
		for _, pod := range pods {
			if pod.ObjectMeta.Namespace == replicationController.ObjectMeta.Namespace &&
				common.IsLabelSelectorMatching(replicationController.Spec.Selector, pod.ObjectMeta.Labels) {
				matchingPods = append(matchingPods, pod)
			}
		}
		podInfo := getReplicationControllerPodInfo(&replicationController, matchingPods)
		podErrors := GetPodsEventWarnings(events, matchingPods)

		podInfo.Warnings = podErrors

		replicationControllerList.ReplicationControllers = append(replicationControllerList.ReplicationControllers,
			ReplicationController{
				Name:              replicationController.ObjectMeta.Name,
				Namespace:         replicationController.ObjectMeta.Namespace,
				Description:       replicationController.Annotations[DescriptionAnnotationKey],
				Labels:            replicationController.ObjectMeta.Labels,
				Pods:              podInfo,
				ContainerImages:   GetContainerImages(&replicationController.Spec.Template.Spec),
				CreationTime:      replicationController.ObjectMeta.CreationTimestamp,
				InternalEndpoints: internalEndpoints,
				ExternalEndpoints: externalEndpoints,
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
			common.IsLabelSelectorMatching(service.Spec.Selector, replicationController.Spec.Selector) {

			matchingServices = append(matchingServices, service)
		}
	}
	return matchingServices
}
