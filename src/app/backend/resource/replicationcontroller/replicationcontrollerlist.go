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
	"errors"
	"log"

	. "github.com/kubernetes/dashboard/resource/common"
	. "github.com/kubernetes/dashboard/resource/event"
	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/api/unversioned"
	client "k8s.io/kubernetes/pkg/client/unversioned"
)

// GetPodsEventWarningsFunc is a callback function used to get the pod status errors.
type GetPodsEventWarningsFunc func(pods []api.Pod) []Event

// GetNodeFunc is a callback function used to get nodes by names.
type GetNodeFunc func(nodeName string) (*api.Node, error)

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
	Pods ReplicationControllerPodInfo `json:"pods"`

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

	channels := &ResourceChannels{
		ReplicationControllerList: GetReplicationControllerListChannel(client, 1),
		ServiceList:               GetServiceListChannel(client, 1),
		PodList:                   GetPodListChannel(client, 1),
		EventList:                 GetEventListChannel(client, 1),
		NodeList:                  GetNodeListChannel(client, 1),
	}

	return GetReplicationControllerListFromChannels(channels)
}

// GetReplicationControllerList returns a list of all Replication Controllers in the cluster
// reading required resource list once from the channels.
func GetReplicationControllerListFromChannels(channels *ResourceChannels) (
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

	// Anonymous callback function to get pods warnings.
	// Function fulfils GetPodsEventWarningsFunc type contract.
	// Based on list of api pods returns list of pod related warning events
	getPodsEventWarningsFn := func(pods []api.Pod) []Event {
		return GetPodsEventWarnings(events, pods)
	}

	// Anonymous callback function to get nodes by their names.
	getNodeFn := func(nodeName string) (*api.Node, error) {
		for _, node := range nodes.Items {
			if node.ObjectMeta.Name == nodeName {
				return &node, nil
			}
		}
		return nil, errors.New("Cannot find node " + nodeName)
	}

	result, err := getReplicationControllerList(replicationControllers.Items, services.Items,
		pods.Items, getPodsEventWarningsFn, getNodeFn)

	if err != nil {
		return nil, err
	}

	return result, nil
}

// Returns a list of all Replication Controller model objects in the cluster, based on all Kubernetes
// Replication Controller and Service API objects.
// The function processes all Replication Controllers API objects and finds matching Services for them.
func getReplicationControllerList(replicationControllers []api.ReplicationController,
	services []api.Service, pods []api.Pod, getPodsEventWarningsFn GetPodsEventWarningsFunc,
	getNodeFn GetNodeFunc) (*ReplicationControllerList, error) {

	replicationControllerList := &ReplicationControllerList{ReplicationControllers: make([]ReplicationController, 0)}

	for _, replicationController := range replicationControllers {
		var containerImages []string
		for _, container := range replicationController.Spec.Template.Spec.Containers {
			containerImages = append(containerImages, container.Image)
		}

		matchingServices := getMatchingServices(services, &replicationController)
		var internalEndpoints []Endpoint
		var externalEndpoints []Endpoint
		for _, service := range matchingServices {
			internalEndpoints = append(internalEndpoints,
				getInternalEndpoint(service.Name, service.Namespace, service.Spec.Ports))
			externalEndpoints = getExternalEndpoints(replicationController, pods, service,
				getNodeFn)
		}

		matchingPods := make([]api.Pod, 0)
		for _, pod := range pods {
			if pod.ObjectMeta.Namespace == replicationController.ObjectMeta.Namespace &&
				isLabelSelectorMatching(replicationController.Spec.Selector, pod.ObjectMeta.Labels) {
				matchingPods = append(matchingPods, pod)
			}
		}
		podInfo := getReplicationControllerPodInfo(&replicationController, matchingPods)
		podErrors := getPodsEventWarningsFn(matchingPods)

		podInfo.Warnings = podErrors

		replicationControllerList.ReplicationControllers = append(replicationControllerList.ReplicationControllers,
			ReplicationController{
				Name:              replicationController.ObjectMeta.Name,
				Namespace:         replicationController.ObjectMeta.Namespace,
				Description:       replicationController.Annotations[DescriptionAnnotationKey],
				Labels:            replicationController.ObjectMeta.Labels,
				Pods:              podInfo,
				ContainerImages:   containerImages,
				CreationTime:      replicationController.ObjectMeta.CreationTimestamp,
				InternalEndpoints: internalEndpoints,
				ExternalEndpoints: externalEndpoints,
			})
	}

	return replicationControllerList, nil
}

// Returns all services that target the same Pods (or subset) as the given Replication Controller.
func getMatchingServices(services []api.Service,
	replicationController *api.ReplicationController) []api.Service {

	var matchingServices []api.Service
	for _, service := range services {
		if service.ObjectMeta.Namespace == replicationController.ObjectMeta.Namespace &&
			isLabelSelectorMatching(service.Spec.Selector, replicationController.Spec.Selector) {

			matchingServices = append(matchingServices, service)
		}
	}
	return matchingServices
}

// Returns true when a Service with the given selector targets the same Pods (or subset) that
// a Replication Controller with the given selector.
func isLabelSelectorMatching(labelSelector map[string]string,
	testedObjectLabels map[string]string) bool {

	// If service has no selectors, then assume it targets different Pods.
	if len(labelSelector) == 0 {
		return false
	}
	for label, value := range labelSelector {
		if rsValue, ok := testedObjectLabels[label]; !ok || rsValue != value {
			return false
		}
	}
	return true
}
