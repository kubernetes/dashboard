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

package replicaset

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/errors"
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	ds "github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/event"
	hpa "github.com/kubernetes/dashboard/src/app/backend/resource/horizontalpodautoscaler"
	"github.com/kubernetes/dashboard/src/app/backend/resource/pod"
	resourceService "github.com/kubernetes/dashboard/src/app/backend/resource/service"
	apps "k8s.io/api/apps/v1beta2"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	k8sClient "k8s.io/client-go/kubernetes"
)

// ReplicaSetDetail is a presentation layer view of Kubernetes Replica Set resource. This means
// it is Replica Set plus additional augmented data we can get from other sources
// (like services that target the same pods).
type ReplicaSetDetail struct {
	ObjectMeta api.ObjectMeta `json:"objectMeta"`
	TypeMeta   api.TypeMeta   `json:"typeMeta"`

	// Aggregate information about pods belonging to this Replica Set.
	PodInfo common.PodInfo `json:"podInfo"`

	// Detailed information about Pods belonging to this Replica Set.
	PodList pod.PodList `json:"podList"`

	// Detailed information about service related to Replica Set.
	ServiceList resourceService.ServiceList `json:"serviceList"`

	// Container images of the Replica Set.
	ContainerImages []string `json:"containerImages"`

	// Init Container images of the Replica Set.
	InitContainerImages []string `json:"initContainerImages"`

	// List of events related to this Replica Set.
	EventList common.EventList `json:"eventList"`

	// Selector of this replica set.
	Selector *metaV1.LabelSelector `json:"selector"`

	// List of Horizontal Pod Autoscalers targeting this Replica Set.
	HorizontalPodAutoscalerList hpa.HorizontalPodAutoscalerList `json:"horizontalPodAutoscalerList"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

// GetReplicaSetDetail gets replica set details.
func GetReplicaSetDetail(client k8sClient.Interface, metricClient metricapi.MetricClient,
	namespace, name string) (*ReplicaSetDetail, error) {
	log.Printf("Getting details of %s service in %s namespace", name, namespace)

	rs, err := client.AppsV1beta2().ReplicaSets(namespace).Get(name, metaV1.GetOptions{})
	if err != nil {
		return nil, err
	}

	eventList, err := event.GetResourceEvents(client, ds.DefaultDataSelect, rs.Namespace, rs.Name)
	nonCriticalErrors, criticalError := errors.HandleError(err)
	if criticalError != nil {
		return nil, criticalError
	}

	podList, err := GetReplicaSetPods(client, metricClient, ds.DefaultDataSelectWithMetrics, name, namespace)
	nonCriticalErrors, criticalError = errors.AppendError(err, nonCriticalErrors)
	if criticalError != nil {
		return nil, criticalError
	}

	podInfo, err := getReplicaSetPodInfo(client, rs)
	nonCriticalErrors, criticalError = errors.AppendError(err, nonCriticalErrors)
	if criticalError != nil {
		return nil, criticalError
	}

	serviceList, err := GetReplicaSetServices(client, ds.DefaultDataSelect, namespace, name)
	nonCriticalErrors, criticalError = errors.AppendError(err, nonCriticalErrors)
	if criticalError != nil {
		return nil, criticalError
	}

	hpas, err := hpa.GetHorizontalPodAutoscalerListForResource(client, namespace, "ReplicaSet", name)
	nonCriticalErrors, criticalError = errors.AppendError(err, nonCriticalErrors)
	if criticalError != nil {
		return nil, criticalError
	}

	rsDetail := toReplicaSetDetail(rs, *eventList, *podList, *podInfo, *serviceList, *hpas, nonCriticalErrors)
	return &rsDetail, nil
}

func toReplicaSetDetail(replicaSet *apps.ReplicaSet, eventList common.EventList, podList pod.PodList,
	podInfo common.PodInfo, serviceList resourceService.ServiceList,
	hpas hpa.HorizontalPodAutoscalerList, nonCriticalErrors []error) ReplicaSetDetail {

	return ReplicaSetDetail{
		ObjectMeta:                  api.NewObjectMeta(replicaSet.ObjectMeta),
		TypeMeta:                    api.NewTypeMeta(api.ResourceKindReplicaSet),
		ContainerImages:             common.GetContainerImages(&replicaSet.Spec.Template.Spec),
		InitContainerImages:         common.GetInitContainerImages(&replicaSet.Spec.Template.Spec),
		Selector:                    replicaSet.Spec.Selector,
		PodInfo:                     podInfo,
		PodList:                     podList,
		ServiceList:                 serviceList,
		EventList:                   eventList,
		HorizontalPodAutoscalerList: hpas,
		Errors: nonCriticalErrors,
	}
}
