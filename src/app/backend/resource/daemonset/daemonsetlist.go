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

package daemonset

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/event"
	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/apis/extensions"
	client "k8s.io/kubernetes/pkg/client/unversioned"
)

// DaemonSetList contains a list of Daemon Sets in the cluster.
type DaemonSetList struct {
	// Unordered list of Daemon Sets
	DaemonSets []DaemonSet `json:"daemonSets"`
	// Meta data describing this list, i.e. total items of object on the list used for pagination
	ListMeta common.ListMeta `json:"listMeta"`
}

// DaemonSet (aka. Daemon Set) plus zero or more Kubernetes services that
// target the Daemon Set.
type DaemonSet struct {
	ObjectMeta common.ObjectMeta `json:"objectMeta"`
	TypeMeta   common.TypeMeta   `json:"typeMeta"`

	// Aggregate information about pods belonging to this Daemon Set.
	Pods common.PodInfo `json:"pods"`

	// Container images of the Daemon Set.
	ContainerImages []string `json:"containerImages"`
}

// GetDaemonSetList returns a list of all Daemon Set in the cluster.
func GetDaemonSetList(client *client.Client, nsQuery *common.NamespaceQuery) (*DaemonSetList, error) {
	log.Printf("Getting list of all daemon sets in the cluster")
	channels := &common.ResourceChannels{
		DaemonSetList: common.GetDaemonSetListChannel(client, nsQuery, 1),
		ServiceList:   common.GetServiceListChannel(client, nsQuery, 1),
		PodList:       common.GetPodListChannel(client, nsQuery, 1),
		EventList:     common.GetEventListChannel(client, nsQuery, 1),
	}

	return GetDaemonSetListFromChannels(channels)
}

// GetDaemonSetList returns a list of all Daemon Seet in the cluster
// reading required resource list once from the channels.
func GetDaemonSetListFromChannels(channels *common.ResourceChannels) (
	*DaemonSetList, error) {

	daemonSets := <-channels.DaemonSetList.List
	if err := <-channels.DaemonSetList.Error; err != nil {
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

	result := getDaemonSetList(daemonSets.Items, pods.Items, events.Items)

	return result, nil
}

// Returns a list of all Daemon Set model objects in the cluster, based on all Kubernetes
// Daemon Set and Service API objects.
// The function processes all Daemon Set API objects and finds matching Services for them.
func getDaemonSetList(daemonSets []extensions.DaemonSet, pods []api.Pod,
	events []api.Event) *DaemonSetList {

	daemonSetList := &DaemonSetList{
		DaemonSets: make([]DaemonSet, 0),
		ListMeta: common.ListMeta{TotalItems: len(daemonSets)},
	}

	for _, daemonSet := range daemonSets {

		matchingPods := make([]api.Pod, 0)
		for _, pod := range pods {
			if pod.ObjectMeta.Namespace == daemonSet.ObjectMeta.Namespace &&
				common.IsLabelSelectorMatching(pod.ObjectMeta.Labels, daemonSet.Spec.Selector) {
				matchingPods = append(matchingPods, pod)
			}
		}
		podInfo := getDaemonSetPodInfo(&daemonSet, matchingPods)
		podErrors := event.GetPodsEventWarnings(events, matchingPods)

		podInfo.Warnings = podErrors

		daemonSetList.DaemonSets = append(daemonSetList.DaemonSets,
			DaemonSet{
				ObjectMeta:      common.NewObjectMeta(daemonSet.ObjectMeta),
				TypeMeta:        common.NewTypeMeta(common.ResourceKindDaemonSet),
				Pods:            podInfo,
				ContainerImages: common.GetContainerImages(&daemonSet.Spec.Template.Spec),
			})
	}

	return daemonSetList
}

// Returns all services that target the same Pods (or subset) as the given Daemon Set.
func getMatchingServicesforDS(services []api.Service,
	daemonSet *extensions.DaemonSet) []api.Service {

	var matchingServices []api.Service
	for _, service := range services {
		if service.ObjectMeta.Namespace == daemonSet.ObjectMeta.Namespace &&
			common.IsLabelSelectorMatching(service.Spec.Selector, daemonSet.Spec.Selector) {

			matchingServices = append(matchingServices, service)
		}
	}
	return matchingServices
}
