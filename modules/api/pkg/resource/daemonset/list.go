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
	apps "k8s.io/api/apps/v1"
	v1 "k8s.io/api/core/v1"
	"k8s.io/client-go/kubernetes"

	metricapi "k8s.io/dashboard/api/pkg/integration/metric/api"
	"k8s.io/dashboard/api/pkg/resource/common"
	"k8s.io/dashboard/api/pkg/resource/dataselect"
	"k8s.io/dashboard/api/pkg/resource/event"
	"k8s.io/dashboard/errors"
	"k8s.io/dashboard/types"
)

// DaemonSetList contains a list of Daemon Sets in the cluster.
type DaemonSetList struct {
	ListMeta          types.ListMeta        `json:"listMeta"`
	DaemonSets        []DaemonSet           `json:"daemonSets"`
	CumulativeMetrics []metricapi.Metric    `json:"cumulativeMetrics"`
	Status            common.ResourceStatus `json:"status"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

// DaemonSet plus zero or more Kubernetes services that target the Daemon Set.
type DaemonSet struct {
	ObjectMeta          types.ObjectMeta `json:"objectMeta"`
	TypeMeta            types.TypeMeta   `json:"typeMeta"`
	Pods                common.PodInfo   `json:"podInfo"`
	ContainerImages     []string         `json:"containerImages"`
	InitContainerImages []string         `json:"initContainerImages"`
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

// GetDaemonSetListFromChannels returns a list of all Daemon Set in the cluster
// reading required resource list once from the channels.
func GetDaemonSetListFromChannels(channels *common.ResourceChannels, dsQuery *dataselect.DataSelectQuery,
	metricClient metricapi.MetricClient) (*DaemonSetList, error) {

	daemonSets := <-channels.DaemonSetList.List
	err := <-channels.DaemonSetList.Error
	nonCriticalErrors, criticalError := errors.ExtractErrors(err)
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

	dsList := toDaemonSetList(daemonSets.Items, pods.Items, events.Items, nonCriticalErrors, dsQuery, metricClient)
	dsList.Status = getStatus(daemonSets, pods.Items, events.Items)
	return dsList, nil
}

func toDaemonSetList(daemonSets []apps.DaemonSet, pods []v1.Pod, events []v1.Event, nonCriticalErrors []error,
	dsQuery *dataselect.DataSelectQuery, metricClient metricapi.MetricClient) *DaemonSetList {

	daemonSetList := &DaemonSetList{
		DaemonSets: make([]DaemonSet, 0),
		ListMeta:   types.ListMeta{TotalItems: len(daemonSets)},
		Errors:     nonCriticalErrors,
	}

	cachedResources := &metricapi.CachedResources{
		Pods: pods,
	}

	dsCells, metricPromises, filteredTotal := dataselect.GenericDataSelectWithFilterAndMetrics(ToCells(daemonSets),
		dsQuery, cachedResources, metricClient)
	daemonSets = FromCells(dsCells)
	daemonSetList.ListMeta = types.ListMeta{TotalItems: filteredTotal}

	for _, daemonSet := range daemonSets {
		daemonSetList.DaemonSets = append(daemonSetList.DaemonSets, toDaemonSet(daemonSet, pods, events))
	}

	cumulativeMetrics, err := metricPromises.GetMetrics()
	daemonSetList.CumulativeMetrics = cumulativeMetrics
	if err != nil {
		daemonSetList.CumulativeMetrics = make([]metricapi.Metric, 0)
	}

	return daemonSetList
}

func toDaemonSet(daemonSet apps.DaemonSet, pods []v1.Pod, events []v1.Event) DaemonSet {
	matchingPods := common.FilterPodsByControllerRef(&daemonSet, pods)
	podInfo := common.GetPodInfo(daemonSet.Status.CurrentNumberScheduled, &daemonSet.Status.DesiredNumberScheduled, matchingPods)
	podInfo.Warnings = event.GetPodsEventWarnings(events, matchingPods)

	return DaemonSet{
		ObjectMeta:          types.NewObjectMeta(daemonSet.ObjectMeta),
		TypeMeta:            types.NewTypeMeta(types.ResourceKindDaemonSet),
		Pods:                podInfo,
		ContainerImages:     common.GetContainerImages(&daemonSet.Spec.Template.Spec),
		InitContainerImages: common.GetInitContainerImages(&daemonSet.Spec.Template.Spec),
	}
}
