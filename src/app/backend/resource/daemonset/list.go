// Copyright 2017 The Kubernetes Dashboard Authors.
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

	"github.com/kubernetes/dashboard/src/app/backend/api"
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/event"
	client "k8s.io/client-go/kubernetes"
	"k8s.io/client-go/pkg/api/v1"
	extensions "k8s.io/client-go/pkg/apis/extensions/v1beta1"
)

// DaemonSetList contains a list of Daemon Sets in the cluster.
type DaemonSetList struct {
	ListMeta api.ListMeta `json:"listMeta"`

	// Unordered list of Daemon Sets
	DaemonSets        []DaemonSet        `json:"daemonSets"`
	CumulativeMetrics []metricapi.Metric `json:"cumulativeMetrics"`
}

// DaemonSet (aka. Daemon Set) plus zero or more Kubernetes services that
// target the Daemon Set.
type DaemonSet struct {
	ObjectMeta api.ObjectMeta `json:"objectMeta"`
	TypeMeta   api.TypeMeta   `json:"typeMeta"`

	// Aggregate information about pods belonging to this Daemon Set.
	Pods common.PodInfo `json:"pods"`

	// Container images of the Daemon Set.
	ContainerImages []string `json:"containerImages"`
}

// GetDaemonSetList returns a list of all Daemon Set in the cluster.
func GetDaemonSetList(client *client.Clientset, nsQuery *common.NamespaceQuery,
	dsQuery *dataselect.DataSelectQuery, metricClient metricapi.MetricClient) (*DaemonSetList, error) {
	log.Print("Getting list of all daemon sets in the cluster")
	channels := &common.ResourceChannels{
		DaemonSetList: common.GetDaemonSetListChannel(client, nsQuery, 1),
		ServiceList:   common.GetServiceListChannel(client, nsQuery, 1),
		PodList:       common.GetPodListChannel(client, nsQuery, 1),
		EventList:     common.GetEventListChannel(client, nsQuery, 1),
	}

	return GetDaemonSetListFromChannels(channels, dsQuery, metricClient)
}

// GetDaemonSetListFromChannels returns a list of all Daemon Seet in the cluster
// reading required resource list once from the channels.
func GetDaemonSetListFromChannels(channels *common.ResourceChannels,
	dsQuery *dataselect.DataSelectQuery, metricClient metricapi.MetricClient) (*DaemonSetList, error) {

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

	result := CreateDaemonSetList(daemonSets.Items, pods.Items, events.Items, dsQuery, metricClient)
	return result, nil
}

// CreateDaemonSetList returns a list of all Daemon Set model objects in the cluster, based on all
// Kubernetes Daemon Set API objects.
func CreateDaemonSetList(daemonSets []extensions.DaemonSet, pods []v1.Pod,
	events []v1.Event, dsQuery *dataselect.DataSelectQuery, metricClient metricapi.MetricClient) *DaemonSetList {

	daemonSetList := &DaemonSetList{
		DaemonSets: make([]DaemonSet, 0),
		ListMeta:   api.ListMeta{TotalItems: len(daemonSets)},
	}

	cachedResources := &metricapi.CachedResources{
		Pods: pods,
	}
	dsCells, metricPromises, filteredTotal := dataselect.
		GenericDataSelectWithFilterAndMetrics(
			ToCells(daemonSets), dsQuery, cachedResources, metricClient)
	daemonSets = FromCells(dsCells)
	daemonSetList.ListMeta = api.ListMeta{TotalItems: filteredTotal}

	for _, daemonSet := range daemonSets {
		matchingPods := common.FilterPodsByOwnerReference(daemonSet.Namespace, daemonSet.UID, pods)
		podInfo := common.GetPodInfo(daemonSet.Status.CurrentNumberScheduled,
			daemonSet.Status.DesiredNumberScheduled, matchingPods)
		podInfo.Warnings = event.GetPodsEventWarnings(events, matchingPods)

		daemonSetList.DaemonSets = append(daemonSetList.DaemonSets,
			DaemonSet{
				ObjectMeta:      api.NewObjectMeta(daemonSet.ObjectMeta),
				TypeMeta:        api.NewTypeMeta(api.ResourceKindDaemonSet),
				Pods:            podInfo,
				ContainerImages: common.GetContainerImages(&daemonSet.Spec.Template.Spec),
			})
	}

	cumulativeMetrics, err := metricPromises.GetMetrics()
	daemonSetList.CumulativeMetrics = cumulativeMetrics
	if err != nil {
		daemonSetList.CumulativeMetrics = make([]metricapi.Metric, 0)
	}

	return daemonSetList
}
