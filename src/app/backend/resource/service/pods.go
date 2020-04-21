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

package service

import (
	"context"

	"github.com/kubernetes/dashboard/src/app/backend/errors"
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/event"
	"github.com/kubernetes/dashboard/src/app/backend/resource/pod"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/fields"
	"k8s.io/apimachinery/pkg/labels"
	k8sClient "k8s.io/client-go/kubernetes"
)

// GetServicePods gets list of pods targeted by given label selector in given namespace.
func GetServicePods(client k8sClient.Interface, metricClient metricapi.MetricClient, namespace,
	name string, dsQuery *dataselect.DataSelectQuery) (*pod.PodList, error) {
	podList := pod.PodList{
		Pods:              []pod.Pod{},
		CumulativeMetrics: []metricapi.Metric{},
	}

	service, err := client.CoreV1().Services(namespace).Get(context.TODO(), name, metaV1.GetOptions{})
	if err != nil {
		return &podList, err
	}

	if service.Spec.Selector == nil {
		return &podList, nil
	}

	labelSelector := labels.SelectorFromSet(service.Spec.Selector)
	channels := &common.ResourceChannels{
		PodList: common.GetPodListChannelWithOptions(client, common.NewSameNamespaceQuery(namespace),
			metaV1.ListOptions{
				LabelSelector: labelSelector.String(),
				FieldSelector: fields.Everything().String(),
			}, 1),
	}

	apiPodList := <-channels.PodList.List
	if err := <-channels.PodList.Error; err != nil {
		return &podList, err
	}

	events, err := event.GetPodsEvents(client, namespace, apiPodList.Items)
	nonCriticalErrors, criticalError := errors.HandleError(err)
	if criticalError != nil {
		return &podList, criticalError
	}

	podList = pod.ToPodList(apiPodList.Items, events, nonCriticalErrors, dsQuery, metricClient)
	return &podList, nil
}
