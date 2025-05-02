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
	"context"

	api "k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	k8sClient "k8s.io/client-go/kubernetes"
	"k8s.io/klog/v2"

	metricapi "k8s.io/dashboard/api/pkg/integration/metric/api"
	"k8s.io/dashboard/api/pkg/resource/common"
	"k8s.io/dashboard/api/pkg/resource/dataselect"
	"k8s.io/dashboard/api/pkg/resource/event"
	"k8s.io/dashboard/api/pkg/resource/pod"
	"k8s.io/dashboard/errors"
)

// GetDaemonSetPods return list of pods targeting daemon set.
func GetDaemonSetPods(client k8sClient.Interface, metricClient metricapi.MetricClient,
	dsQuery *dataselect.DataSelectQuery, daemonSetName, namespace string) (*pod.PodList, error) {
	klog.V(4).Infof("Getting replication controller %s pods in namespace %s", daemonSetName, namespace)

	pods, err := getRawDaemonSetPods(client, daemonSetName, namespace)
	if err != nil {
		return pod.EmptyPodList, err
	}

	events, err := event.GetPodsEvents(client, namespace, pods)
	nonCriticalErrors, criticalError := errors.ExtractErrors(err)
	if criticalError != nil {
		return nil, criticalError
	}

	podList := pod.ToPodList(pods, events, nonCriticalErrors, dsQuery, metricClient)
	return &podList, nil
}

// Returns array of api pods targeting daemon set with given name.
func getRawDaemonSetPods(client k8sClient.Interface, daemonSetName, namespace string) ([]api.Pod, error) {
	daemonSet, err := client.AppsV1().DaemonSets(namespace).Get(context.TODO(), daemonSetName, metaV1.GetOptions{})
	if err != nil {
		return nil, err
	}

	selector, err := metaV1.LabelSelectorAsSelector(daemonSet.Spec.Selector)
	if err != nil {
		return nil, err
	}
	options := metaV1.ListOptions{LabelSelector: selector.String()}

	channels := &common.ResourceChannels{
		PodList: common.GetPodListChannelWithOptions(client, common.NewSameNamespaceQuery(namespace), options, 1),
	}

	podList := <-channels.PodList.List
	if err := <-channels.PodList.Error; err != nil {
		return nil, err
	}

	matchingPods := common.FilterPodsByControllerRef(daemonSet, podList.Items)
	return matchingPods, nil
}
