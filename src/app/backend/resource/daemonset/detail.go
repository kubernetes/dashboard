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
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/errors"
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	ds "github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/event"
	"github.com/kubernetes/dashboard/src/app/backend/resource/pod"
	resourceService "github.com/kubernetes/dashboard/src/app/backend/resource/service"
	"k8s.io/apimachinery/pkg/apis/meta/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	k8sClient "k8s.io/client-go/kubernetes"
)

// DaemonSeDetail represents detailed information about a Daemon Set.
type DaemonSetDetail struct {
	ObjectMeta api.ObjectMeta `json:"objectMeta"`
	TypeMeta   api.TypeMeta   `json:"typeMeta"`

	// Label selector of the Daemon Set.
	LabelSelector *v1.LabelSelector `json:"labelSelector,omitempty"`

	// Container image list of the pod template specified by this Daemon Set.
	ContainerImages []string `json:"containerImages"`

	// Init Container image list of the pod template specified by this Daemon Set.
	InitContainerImages []string `json:"initContainerImages"`

	// Aggregate information about pods of this daemon set.
	PodInfo common.PodInfo `json:"podInfo"`

	// Detailed information about Pods belonging to this Daemon Set.
	PodList pod.PodList `json:"podList"`

	// Detailed information about service related to Daemon Set.
	ServiceList resourceService.ServiceList `json:"serviceList"`

	// True when the data contains at least one pod with metrics information, false otherwise.
	HasMetrics bool `json:"hasMetrics"`

	// List of events related to this daemon set
	EventList common.EventList `json:"eventList"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

// Returns detailed information about the given daemon set in the given namespace.
func GetDaemonSetDetail(client k8sClient.Interface, metricClient metricapi.MetricClient,
	namespace, name string) (*DaemonSetDetail, error) {

	log.Printf("Getting details of %s daemon set in %s namespace", name, namespace)
	daemonSet, err := client.AppsV1beta2().DaemonSets(namespace).Get(name, metaV1.GetOptions{})
	if err != nil {
		return nil, err
	}

	podList, err := GetDaemonSetPods(client, metricClient, ds.DefaultDataSelectWithMetrics, name, namespace)
	nonCriticalErrors, criticalError := errors.HandleError(err)
	if criticalError != nil {
		return nil, criticalError
	}

	podInfo, err := getDaemonSetPodInfo(client, daemonSet)
	nonCriticalErrors, criticalError = errors.AppendError(err, nonCriticalErrors)
	if criticalError != nil {
		return nil, criticalError
	}

	serviceList, err := GetDaemonSetServices(client, ds.DefaultDataSelect, namespace, name)
	nonCriticalErrors, criticalError = errors.AppendError(err, nonCriticalErrors)
	if criticalError != nil {
		return nil, criticalError
	}

	eventList, err := event.GetResourceEvents(client, ds.DefaultDataSelect, daemonSet.Namespace, daemonSet.Name)
	nonCriticalErrors, criticalError = errors.AppendError(err, nonCriticalErrors)
	if criticalError != nil {
		return nil, criticalError
	}

	daemonSetDetail := &DaemonSetDetail{
		ObjectMeta:    api.NewObjectMeta(daemonSet.ObjectMeta),
		TypeMeta:      api.NewTypeMeta(api.ResourceKindDaemonSet),
		LabelSelector: daemonSet.Spec.Selector,
		PodInfo:       *podInfo,
		PodList:       *podList,
		ServiceList:   *serviceList,
		EventList:     *eventList,
		Errors:        nonCriticalErrors,
	}

	for _, container := range daemonSet.Spec.Template.Spec.Containers {
		daemonSetDetail.ContainerImages = append(daemonSetDetail.ContainerImages, container.Image)
	}

	for _, initContainer := range daemonSet.Spec.Template.Spec.InitContainers {
		daemonSetDetail.InitContainerImages = append(daemonSetDetail.InitContainerImages, initContainer.Image)
	}

	return daemonSetDetail, nil
}
