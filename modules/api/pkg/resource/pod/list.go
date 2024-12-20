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

package pod

import (
	v1 "k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	k8sClient "k8s.io/client-go/kubernetes"
	"k8s.io/klog/v2"

	metricapi "k8s.io/dashboard/api/pkg/integration/metric/api"
	"k8s.io/dashboard/api/pkg/resource/common"
	"k8s.io/dashboard/api/pkg/resource/dataselect"
	"k8s.io/dashboard/api/pkg/resource/event"
	"k8s.io/dashboard/errors"
	"k8s.io/dashboard/types"
)

// PodList contains a list of Pods in the cluster.
type PodList struct {
	ListMeta          types.ListMeta     `json:"listMeta"`
	CumulativeMetrics []metricapi.Metric `json:"cumulativeMetrics"`

	// Basic information about resources status on the list.
	Status common.ResourceStatus `json:"status"`

	// Unordered list of Pods.
	Pods []Pod `json:"pods"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

type PodStatus struct {
	Status          string              `json:"status"`
	PodPhase        v1.PodPhase         `json:"podPhase"`
	ContainerStates []v1.ContainerState `json:"containerStates"`
}

// Pod is a presentation layer view of Kubernetes Pod resource. This means it is Pod plus additional augmented data
// we can get from other sources (like services that target it).
type Pod struct {
	ObjectMeta types.ObjectMeta `json:"objectMeta"`
	TypeMeta   types.TypeMeta   `json:"typeMeta"`

	// Status determined based on the same logic as kubectl.
	Status string `json:"status"`

	// RestartCount of containers restarts.
	RestartCount int32 `json:"restartCount"`

	// Pod metrics.
	Metrics *PodMetrics `json:"metrics"`

	// Pod warning events
	Warnings []common.Event `json:"warnings"`

	// NodeName of the Node this Pod runs on.
	NodeName string `json:"nodeName"`

	// ContainerImages holds a list of the Pod images.
	ContainerImages []string `json:"containerImages"`

	ContainerStatuses []ContainerStatus `json:"containerStatuses"`

	AllocatedResources PodAllocatedResources `json:"allocatedResources"`
}

// PodAllocatedResources describes pod allocated resources.
type PodAllocatedResources struct {
	// CPURequests is number of allocated milicores.
	CPURequests int64 `json:"cpuRequests"`

	// CPULimits is defined CPU limit.
	CPULimits int64 `json:"cpuLimits"`

	// MemoryRequests is a fraction of memory, that is allocated.
	MemoryRequests int64 `json:"memoryRequests"`

	// MemoryLimits is defined memory limit.
	MemoryLimits int64 `json:"memoryLimits"`
}

var EmptyPodList = &PodList{
	Pods:   make([]Pod, 0),
	Errors: make([]error, 0),
	ListMeta: types.ListMeta{
		TotalItems: 0,
	},
}

// GetPodList returns a list of all Pods in the cluster.
func GetPodList(client k8sClient.Interface, metricClient metricapi.MetricClient, nsQuery *common.NamespaceQuery,
	dsQuery *dataselect.DataSelectQuery) (*PodList, error) {
	klog.V(4).Infof("Getting list of all pods in the cluster")

	channels := &common.ResourceChannels{
		PodList:   common.GetPodListChannelWithOptions(client, nsQuery, metaV1.ListOptions{}, 1),
		EventList: common.GetEventListChannel(client, nsQuery, 1),
	}

	return GetPodListFromChannels(channels, dsQuery, metricClient)
}

// GetPodListFromChannels returns a list of all Pods in the cluster
// reading required resource list once from the channels.
func GetPodListFromChannels(channels *common.ResourceChannels, dsQuery *dataselect.DataSelectQuery,
	metricClient metricapi.MetricClient) (*PodList, error) {

	pods := <-channels.PodList.List
	err := <-channels.PodList.Error
	nonCriticalErrors, criticalError := errors.ExtractErrors(err)
	if criticalError != nil {
		return nil, criticalError
	}

	eventList := <-channels.EventList.List
	err = <-channels.EventList.Error
	nonCriticalErrors, criticalError = errors.AppendError(err, nonCriticalErrors)
	if criticalError != nil {
		return nil, criticalError
	}

	podList := ToPodList(pods.Items, eventList.Items, nonCriticalErrors, dsQuery, metricClient)
	podList.Status = getStatus(pods, eventList.Items)
	return &podList, nil
}

func ToPodList(pods []v1.Pod, events []v1.Event, nonCriticalErrors []error, dsQuery *dataselect.DataSelectQuery,
	metricClient metricapi.MetricClient) PodList {
	podList := PodList{
		Pods:   make([]Pod, 0),
		Errors: nonCriticalErrors,
	}

	podCells, cumulativeMetricsPromises, filteredTotal := dataselect.
		GenericDataSelectWithFilterAndMetrics(toCells(pods), dsQuery, metricapi.NoResourceCache, metricClient)
	pods = fromCells(podCells)
	podList.ListMeta = types.ListMeta{TotalItems: filteredTotal}

	metrics, err := getMetricsPerPod(pods, metricClient, dsQuery)
	if err != nil {
		klog.ErrorS(err, "skipping metrics")
	}

	for _, pod := range pods {
		warnings := event.GetPodsEventWarnings(events, []v1.Pod{pod})
		podDetail := toPod(&pod, metrics, warnings)
		podList.Pods = append(podList.Pods, podDetail)
	}

	cumulativeMetrics, err := cumulativeMetricsPromises.GetMetrics()
	if err != nil {
		klog.ErrorS(err, "skipping metrics")
		cumulativeMetrics = make([]metricapi.Metric, 0)
	}

	podList.CumulativeMetrics = cumulativeMetrics
	return podList
}

func toPod(pod *v1.Pod, metrics *MetricsByPod, warnings []common.Event) Pod {
	allocatedResources, err := getPodAllocatedResources(pod)
	if err != nil {
		klog.ErrorS(err, "couldn't get allocated resources", "pod", pod.Name)
	}

	podDetail := Pod{
		ObjectMeta:         types.NewObjectMeta(pod.ObjectMeta),
		TypeMeta:           types.NewTypeMeta(types.ResourceKindPod),
		Warnings:           warnings,
		Status:             getPodStatus(*pod),
		RestartCount:       getRestartCount(*pod),
		NodeName:           pod.Spec.NodeName,
		ContainerImages:    common.GetContainerImages(&pod.Spec),
		ContainerStatuses:  ToContainerStatuses(append(pod.Status.InitContainerStatuses, pod.Status.ContainerStatuses...)),
		AllocatedResources: allocatedResources,
	}

	if m, exists := metrics.MetricsMap[pod.UID]; exists {
		podDetail.Metrics = &m
	}

	return podDetail
}
