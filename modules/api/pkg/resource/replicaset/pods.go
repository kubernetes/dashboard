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
	"context"

	apps "k8s.io/api/apps/v1"
	v1 "k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/labels"
	k8sClient "k8s.io/client-go/kubernetes"
	"k8s.io/klog/v2"

	metricapi "k8s.io/dashboard/api/pkg/integration/metric/api"
	"k8s.io/dashboard/api/pkg/resource/common"
	"k8s.io/dashboard/api/pkg/resource/dataselect"
	"k8s.io/dashboard/api/pkg/resource/event"
	"k8s.io/dashboard/api/pkg/resource/pod"
	"k8s.io/dashboard/errors"
)

// GetReplicaSetPods return list of pods targeting replica set.
func GetReplicaSetPods(client k8sClient.Interface, metricClient metricapi.MetricClient,
	dsQuery *dataselect.DataSelectQuery, replicaSetName, namespace string) (*pod.PodList, error) {
	klog.V(4).Infof("Getting replication controller %s pods in namespace %s", replicaSetName, namespace)

	pods, err := getRawReplicaSetPods(client, replicaSetName, namespace)
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

func getRawReplicaSetPods(client k8sClient.Interface, replicaSetName, namespace string) ([]v1.Pod, error) {
	rs, err := client.AppsV1().ReplicaSets(namespace).Get(context.TODO(), replicaSetName, metaV1.GetOptions{})
	if err != nil {
		return nil, err
	}

	labelSelector := labels.SelectorFromSet(rs.Spec.Selector.MatchLabels)
	channels := &common.ResourceChannels{
		PodList: common.GetPodListChannelWithOptions(client, common.NewSameNamespaceQuery(namespace),
			metaV1.ListOptions{
				LabelSelector: labelSelector.String(),
			}, 1),
	}

	podList := <-channels.PodList.List
	if err := <-channels.PodList.Error; err != nil {
		return nil, err
	}

	return common.FilterPodsByControllerRef(rs, podList.Items), nil
}

func getReplicaSetPodInfo(client k8sClient.Interface, replicaSet *apps.ReplicaSet) (*common.PodInfo, error) {
	labelSelector := labels.SelectorFromSet(replicaSet.Spec.Selector.MatchLabels)
	channels := &common.ResourceChannels{
		PodList: common.GetPodListChannelWithOptions(client, common.NewSameNamespaceQuery(replicaSet.Namespace),
			metaV1.ListOptions{
				LabelSelector: labelSelector.String(),
			}, 1),
	}

	podList := <-channels.PodList.List
	if err := <-channels.PodList.Error; err != nil {
		return nil, err
	}

	filterPod := common.FilterPodsByControllerRef(replicaSet, podList.Items)
	podInfo := common.GetPodInfo(replicaSet.Status.Replicas, replicaSet.Spec.Replicas, filterPod)
	return &podInfo, nil
}
