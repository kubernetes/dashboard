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
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/errors"
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/event"
	v1 "k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	k8sClient "k8s.io/client-go/kubernetes"
)

// PodList contains a list of Pods in the cluster.
type PodList struct {
	ListMeta          api.ListMeta       `json:"listMeta"`
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
	ObjectMeta api.ObjectMeta `json:"objectMeta"`
	TypeMeta   api.TypeMeta   `json:"typeMeta"`

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
}

var EmptyPodList = &PodList{
	Pods:   make([]Pod, 0),
	Errors: make([]error, 0),
	ListMeta: api.ListMeta{
		TotalItems: 0,
	},
}

// GetPodList returns a list of all Pods in the cluster.
func GetPodList(client k8sClient.Interface, metricClient metricapi.MetricClient, nsQuery *common.NamespaceQuery,
	dsQuery *dataselect.DataSelectQuery) (*PodList, error) {
	log.Print("Getting list of all pods in the cluster")

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
	nonCriticalErrors, criticalError := errors.HandleError(err)
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
	podList.ListMeta = api.ListMeta{TotalItems: filteredTotal}

	metrics, err := getMetricsPerPod(pods, metricClient, dsQuery)
	if err != nil {
		log.Printf("Skipping metrics because of error: %s\n", err)
	}

	for _, pod := range pods {
		warnings := event.GetPodsEventWarnings(events, []v1.Pod{pod})
		podDetail := toPod(&pod, metrics, warnings)
		podList.Pods = append(podList.Pods, podDetail)
	}

	cumulativeMetrics, err := cumulativeMetricsPromises.GetMetrics()
	if err != nil {
		log.Printf("Skipping metrics because of error: %s\n", err)
		cumulativeMetrics = make([]metricapi.Metric, 0)
	}

	podList.CumulativeMetrics = cumulativeMetrics
	return podList
}

func toPod(pod *v1.Pod, metrics *MetricsByPod, warnings []common.Event) Pod {
	podDetail := Pod{
		ObjectMeta:      api.NewObjectMeta(pod.ObjectMeta),
		TypeMeta:        api.NewTypeMeta(api.ResourceKindPod),
		Warnings:        warnings,
		Status:          getPodStatus(*pod),
		RestartCount:    getRestartCount(*pod),
		NodeName:        pod.Spec.NodeName,
		ContainerImages: common.GetContainerImages(&pod.Spec),
	}

	if m, exists := metrics.MetricsMap[pod.UID]; exists {
		podDetail.Metrics = &m
	}

	return podDetail
}
