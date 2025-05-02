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

package statefulset

import (
	apps "k8s.io/api/apps/v1"
	v1 "k8s.io/api/core/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/klog/v2"

	metricapi "k8s.io/dashboard/api/pkg/integration/metric/api"
	"k8s.io/dashboard/api/pkg/resource/common"
	"k8s.io/dashboard/api/pkg/resource/dataselect"
	"k8s.io/dashboard/api/pkg/resource/event"
	"k8s.io/dashboard/errors"
	"k8s.io/dashboard/types"
)

// StatefulSetList contains a list of Stateful Sets in the cluster.
type StatefulSetList struct {
	ListMeta types.ListMeta `json:"listMeta"`

	Status            common.ResourceStatus `json:"status"`
	StatefulSets      []StatefulSet         `json:"statefulSets"`
	CumulativeMetrics []metricapi.Metric    `json:"cumulativeMetrics"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

// StatefulSet is a presentation layer view of Kubernetes Stateful Set resource.
type StatefulSet struct {
	ObjectMeta          types.ObjectMeta `json:"objectMeta"`
	TypeMeta            types.TypeMeta   `json:"typeMeta"`
	Pods                common.PodInfo   `json:"podInfo"`
	ContainerImages     []string         `json:"containerImages"`
	InitContainerImages []string         `json:"initContainerImages"`
}

// GetStatefulSetList returns a list of all Stateful Sets in the cluster.
func GetStatefulSetList(client kubernetes.Interface, nsQuery *common.NamespaceQuery,
	dsQuery *dataselect.DataSelectQuery, metricClient metricapi.MetricClient) (*StatefulSetList, error) {
	klog.V(4).Infof("Getting list of all stateful sets in the cluster")

	channels := &common.ResourceChannels{
		StatefulSetList: common.GetStatefulSetListChannel(client, nsQuery, 1),
		PodList:         common.GetPodListChannel(client, nsQuery, 1),
		EventList:       common.GetEventListChannel(client, nsQuery, 1),
	}

	return GetStatefulSetListFromChannels(channels, dsQuery, metricClient)
}

// GetStatefulSetListFromChannels returns a list of all Stateful Sets in the cluster reading
// required resource list once from the channels.
func GetStatefulSetListFromChannels(channels *common.ResourceChannels, dsQuery *dataselect.DataSelectQuery,
	metricClient metricapi.MetricClient) (*StatefulSetList, error) {

	statefulSets := <-channels.StatefulSetList.List
	err := <-channels.StatefulSetList.Error
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

	ssList := toStatefulSetList(statefulSets.Items, pods.Items, events.Items, nonCriticalErrors, dsQuery, metricClient)
	ssList.Status = getStatus(statefulSets, pods.Items, events.Items)
	return ssList, nil
}

func toStatefulSetList(statefulSets []apps.StatefulSet, pods []v1.Pod, events []v1.Event, nonCriticalErrors []error,
	dsQuery *dataselect.DataSelectQuery, metricClient metricapi.MetricClient) *StatefulSetList {

	statefulSetList := &StatefulSetList{
		StatefulSets: make([]StatefulSet, 0),
		ListMeta:     types.ListMeta{TotalItems: len(statefulSets)},
		Errors:       nonCriticalErrors,
	}

	cachedResources := &metricapi.CachedResources{
		Pods: pods,
	}
	ssCells, metricPromises, filteredTotal := dataselect.GenericDataSelectWithFilterAndMetrics(
		toCells(statefulSets), dsQuery, cachedResources, metricClient)
	statefulSets = fromCells(ssCells)
	statefulSetList.ListMeta = types.ListMeta{TotalItems: filteredTotal}

	for _, statefulSet := range statefulSets {
		matchingPods := common.FilterPodsByControllerRef(&statefulSet, pods)
		podInfo := common.GetPodInfo(statefulSet.Status.Replicas, statefulSet.Spec.Replicas, matchingPods)
		podInfo.Warnings = event.GetPodsEventWarnings(events, matchingPods)
		statefulSetList.StatefulSets = append(statefulSetList.StatefulSets, toStatefulSet(&statefulSet, &podInfo))
	}

	cumulativeMetrics, err := metricPromises.GetMetrics()
	statefulSetList.CumulativeMetrics = cumulativeMetrics
	if err != nil {
		statefulSetList.CumulativeMetrics = make([]metricapi.Metric, 0)
	}

	return statefulSetList
}

func toStatefulSet(statefulSet *apps.StatefulSet, podInfo *common.PodInfo) StatefulSet {
	return StatefulSet{
		ObjectMeta:          types.NewObjectMeta(statefulSet.ObjectMeta),
		TypeMeta:            types.NewTypeMeta(types.ResourceKindStatefulSet),
		ContainerImages:     common.GetContainerImages(&statefulSet.Spec.Template.Spec),
		InitContainerImages: common.GetInitContainerImages(&statefulSet.Spec.Template.Spec),
		Pods:                *podInfo,
	}
}
