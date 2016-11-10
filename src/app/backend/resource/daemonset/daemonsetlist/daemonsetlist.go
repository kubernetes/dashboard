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

package daemonsetlist

import (
	"log"

	heapster "github.com/kubernetes/dashboard/src/app/backend/client"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/event"
	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/apis/extensions"
	client "k8s.io/kubernetes/pkg/client/clientset_generated/internalclientset"

	"github.com/kubernetes/dashboard/src/app/backend/resource/daemonset"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/metric"
)

// DaemonSetList contains a list of Daemon Sets in the cluster.
type DaemonSetList struct {
	ListMeta common.ListMeta `json:"listMeta"`

	// Unordered list of Daemon Sets
	DaemonSets        []DaemonSet     `json:"daemonSets"`
	CumulativeMetrics []metric.Metric `json:"cumulativeMetrics"`
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
func GetDaemonSetList(client *client.Clientset, nsQuery *common.NamespaceQuery,
	dsQuery *dataselect.DataSelectQuery, heapsterClient *heapster.HeapsterClient) (*DaemonSetList, error) {
	log.Print("Getting list of all daemon sets in the cluster")
	channels := &common.ResourceChannels{
		DaemonSetList: common.GetDaemonSetListChannel(client, nsQuery, 1),
		ServiceList:   common.GetServiceListChannel(client, nsQuery, 1),
		PodList:       common.GetPodListChannel(client, nsQuery, 1),
		EventList:     common.GetEventListChannel(client, nsQuery, 1),
	}

	return GetDaemonSetListFromChannels(channels, dsQuery, heapsterClient)
}

// GetDaemonSetListFromChannels returns a list of all Daemon Seet in the cluster
// reading required resource list once from the channels.
func GetDaemonSetListFromChannels(channels *common.ResourceChannels,
	dsQuery *dataselect.DataSelectQuery, heapsterClient *heapster.HeapsterClient) (*DaemonSetList, error) {

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

	result := CreateDaemonSetList(daemonSets.Items, pods.Items, events.Items, dsQuery, heapsterClient)
	return result, nil
}

// CreateDaemonSetList returns a list of all Daemon Set model objects in the cluster, based on all
// Kubernetes Daemon Set API objects.
func CreateDaemonSetList(daemonSets []extensions.DaemonSet, pods []api.Pod,
	events []api.Event, dsQuery *dataselect.DataSelectQuery, heapsterClient *heapster.HeapsterClient) *DaemonSetList {

	daemonSetList := &DaemonSetList{
		DaemonSets: make([]DaemonSet, 0),
		ListMeta:   common.ListMeta{TotalItems: len(daemonSets)},
	}

	cachedResources := &dataselect.CachedResources{
		Pods: pods,
	}
	replicationControllerCells, metricPromises := dataselect.GenericDataSelectWithMetrics(daemonset.ToCells(daemonSets), dsQuery, cachedResources, heapsterClient)
	daemonSets = daemonset.FromCells(replicationControllerCells)

	for _, daemonSet := range daemonSets {
		matchingPods := common.FilterNamespacedPodsByLabelSelector(pods, daemonSet.Namespace,
			daemonSet.Spec.Selector)
		podInfo := common.GetPodInfo(daemonSet.Status.CurrentNumberScheduled,
			daemonSet.Status.DesiredNumberScheduled, matchingPods)
		podInfo.Warnings = event.GetPodsEventWarnings(events, matchingPods)

		daemonSetList.DaemonSets = append(daemonSetList.DaemonSets,
			DaemonSet{
				ObjectMeta:      common.NewObjectMeta(daemonSet.ObjectMeta),
				TypeMeta:        common.NewTypeMeta(common.ResourceKindDaemonSet),
				Pods:            podInfo,
				ContainerImages: common.GetContainerImages(&daemonSet.Spec.Template.Spec),
			})
	}

	cumulativeMetrics, err := metricPromises.GetMetrics()
	daemonSetList.CumulativeMetrics = cumulativeMetrics
	if err != nil {
		daemonSetList.CumulativeMetrics = make([]metric.Metric, 0)
	}

	return daemonSetList
}
