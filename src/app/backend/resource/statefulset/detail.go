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
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/errors"
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	ds "github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/event"
	"github.com/kubernetes/dashboard/src/app/backend/resource/pod"
	apps "k8s.io/api/apps/v1beta2"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

// StatefulSetDetail is a presentation layer view of Kubernetes Stateful Set resource. This means it is Stateful
// Set plus additional augmented data we can get from other sources (like services that target the same pods).
type StatefulSetDetail struct {
	ObjectMeta          api.ObjectMeta   `json:"objectMeta"`
	TypeMeta            api.TypeMeta     `json:"typeMeta"`
	PodInfo             common.PodInfo   `json:"podInfo"`
	PodList             pod.PodList      `json:"podList"`
	ContainerImages     []string         `json:"containerImages"`
	InitContainerImages []string         `json:"initContainerImages"`
	EventList           common.EventList `json:"eventList"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

// GetStatefulSetDetail gets Stateful Set details.
func GetStatefulSetDetail(client kubernetes.Interface, metricClient metricapi.MetricClient, namespace,
	name string) (*StatefulSetDetail, error) {
	log.Printf("Getting details of %s statefulset in %s namespace", name, namespace)

	ss, err := client.AppsV1beta2().StatefulSets(namespace).Get(name, metaV1.GetOptions{})
	if err != nil {
		return nil, err
	}

	podList, err := GetStatefulSetPods(client, metricClient, ds.DefaultDataSelectWithMetrics, name, namespace)
	nonCriticalErrors, criticalError := errors.HandleError(err)
	if criticalError != nil {
		return nil, criticalError
	}

	podInfo, err := getStatefulSetPodInfo(client, ss)
	nonCriticalErrors, criticalError = errors.AppendError(err, nonCriticalErrors)
	if criticalError != nil {
		return nil, criticalError
	}

	events, err := event.GetResourceEvents(client, ds.DefaultDataSelect, ss.Namespace, ss.Name)
	nonCriticalErrors, criticalError = errors.AppendError(err, nonCriticalErrors)
	if criticalError != nil {
		return nil, criticalError
	}

	ssDetail := getStatefulSetDetail(ss, *events, *podList, *podInfo, nonCriticalErrors)
	return &ssDetail, nil
}

func getStatefulSetDetail(statefulSet *apps.StatefulSet, eventList common.EventList, podList pod.PodList,
	podInfo common.PodInfo, nonCriticalErrors []error) StatefulSetDetail {
	return StatefulSetDetail{
		ObjectMeta:          api.NewObjectMeta(statefulSet.ObjectMeta),
		TypeMeta:            api.NewTypeMeta(api.ResourceKindStatefulSet),
		ContainerImages:     common.GetContainerImages(&statefulSet.Spec.Template.Spec),
		InitContainerImages: common.GetInitContainerImages(&statefulSet.Spec.Template.Spec),
		PodInfo:             podInfo,
		PodList:             podList,
		EventList:           eventList,
		Errors:              nonCriticalErrors,
	}
}
