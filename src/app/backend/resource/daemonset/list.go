// Copyright 2017 The Kubernetes Authors.
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
	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/errors"
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/event"
	apps "k8s.io/api/apps/v1beta2"
	"k8s.io/api/core/v1"
	"k8s.io/client-go/kubernetes"
)

// DaemonSetList contains a list of Daemon Sets in the cluster.
type DaemonSetList struct {
	ListMeta          api.ListMeta       `json:"listMeta"`
	DaemonSets        []DaemonSet        `json:"daemonSets"`
	CumulativeMetrics []metricapi.Metric `json:"cumulativeMetrics"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

// DaemonSet plus zero or more Kubernetes services that target the Daemon Set.
type DaemonSet struct {
	ObjectMeta api.ObjectMeta `json:"objectMeta"`
	TypeMeta   api.TypeMeta   `json:"typeMeta"`

	// Aggregate information about pods belonging to this Daemon Set.
	Pods common.PodInfo `json:"pods"`

	// Container images of the Daemon Set.
	ContainerImages []string `json:"containerImages"`

	// InitContainer images of the Daemon Set.
	InitContainerImages []string `json:"initContainerImages"`
}

// GetDaemonSetList returns a list of all Daemon Set in the cluster.
func GetDaemonSetList(client kubernetes.Interface, nsQuery *common.NamespaceQuery, dsQuery *dataselect.DataSelectQuery,
	metricClient metricapi.MetricClient) (*DaemonSetList, error) {
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
func GetDaemonSetListFromChannels(channels *common.ResourceChannels, dsQuery *dataselect.DataSelectQuery,
	metricClient metricapi.MetricClient) (*DaemonSetList, error) {

	daemonSets := <-channels.DaemonSetList.List
	err := <-channels.DaemonSetList.Error
	nonCriticalErrors, criticalError := errors.HandleError(err)
	if criticalError != nil {
		return nil, criticalError
	}

	pods := <-channels.PodList.List
	err = <-channels.PodList.Error
	nonCriticalErrors, criticalError = errors.AppendError(err, nonCriticalErrors)
	if criticalError != nil {
		return nil, criticalError
	}

	events := <-channels.EventList.List
	err = <-channels.EventList.Error
	nonCriticalErrors, criticalError = errors.AppendError(err, nonCriticalErrors)
	if criticalError != nil {
		return nil, criticalError
	}

	result := toDaemonSetList(daemonSets.Items, pods.Items, events.Items, nonCriticalErrors, dsQuery, metricClient)
	return result, nil
}

func toDaemonSetList(daemonSets []apps.DaemonSet, pods []v1.Pod, events []v1.Event, nonCriticalErrors []error,
	dsQuery *dataselect.DataSelectQuery, metricClient metricapi.MetricClient) *DaemonSetList {

	daemonSetList := &DaemonSetList{
		DaemonSets: make([]DaemonSet, 0),
		ListMeta:   api.ListMeta{TotalItems: len(daemonSets)},
		Errors:     nonCriticalErrors,
	}

	cachedResources := &metricapi.CachedResources{
		Pods: pods,
	}

	dsCells, metricPromises, filteredTotal := dataselect.GenericDataSelectWithFilterAndMetrics(ToCells(daemonSets),
		dsQuery, cachedResources, metricClient)
	daemonSets = FromCells(dsCells)
	daemonSetList.ListMeta = api.ListMeta{TotalItems: filteredTotal}

	for _, daemonSet := range daemonSets {
		matchingPods := common.FilterPodsByControllerRef(&daemonSet, pods)
		podInfo := common.GetPodInfo(daemonSet.Status.CurrentNumberScheduled,
			&daemonSet.Status.DesiredNumberScheduled, matchingPods)
		podInfo.Warnings = event.GetPodsEventWarnings(events, matchingPods)

		daemonSetList.DaemonSets = append(daemonSetList.DaemonSets, DaemonSet{
			ObjectMeta:          api.NewObjectMeta(daemonSet.ObjectMeta),
			TypeMeta:            api.NewTypeMeta(api.ResourceKindDaemonSet),
			Pods:                podInfo,
			ContainerImages:     common.GetContainerImages(&daemonSet.Spec.Template.Spec),
			InitContainerImages: common.GetInitContainerImages(&daemonSet.Spec.Template.Spec),
		})
	}

	cumulativeMetrics, err := metricPromises.GetMetrics()
	daemonSetList.CumulativeMetrics = cumulativeMetrics
	if err != nil {
		daemonSetList.CumulativeMetrics = make([]metricapi.Metric, 0)
	}

	return daemonSetList
}
