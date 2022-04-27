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

package replicationcontroller

import (
	"context"
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/errors"
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/event"
	"github.com/kubernetes/dashboard/src/app/backend/resource/pod"
	v1 "k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	k8sClient "k8s.io/client-go/kubernetes"
)

// GetReplicationControllerPods return list of pods targeting replication controller associated
// to given name.
func GetReplicationControllerPods(client k8sClient.Interface,
	metricClient metricapi.MetricClient,
	dsQuery *dataselect.DataSelectQuery, rcName, namespace string) (*pod.PodList, error) {
	log.Printf("Getting replication controller %s pods in namespace %s", rcName, namespace)

	pods, err := getRawReplicationControllerPods(client, rcName, namespace)
	if err != nil {
		return pod.EmptyPodList, err
	}

	events, err := event.GetPodsEvents(client, namespace, pods)
	nonCriticalErrors, criticalError := errors.HandleError(err)
	if criticalError != nil {
		return nil, criticalError
	}

	podList := pod.ToPodList(pods, events, nonCriticalErrors, dsQuery, metricClient)
	return &podList, nil
}

func getRawReplicationControllerPods(client k8sClient.Interface, rcName, namespace string) ([]v1.Pod, error) {
	rc, err := client.CoreV1().ReplicationControllers(namespace).Get(context.TODO(), rcName, metaV1.GetOptions{})
	if err != nil {
		return nil, err
	}

	channels := &common.ResourceChannels{
		PodList: common.GetPodListChannel(client, common.NewSameNamespaceQuery(namespace), 1),
	}

	podList := <-channels.PodList.List
	if err := <-channels.PodList.Error; err != nil {
		return nil, err
	}

	return common.FilterPodsByControllerRef(rc, podList.Items), nil
}

// getReplicationControllerPodInfo returns simple info about pods(running, desired, failing, etc.)
// related to given replication controller.
func getReplicationControllerPodInfo(client k8sClient.Interface, rc *v1.ReplicationController,
	namespace string) (*common.PodInfo, error) {

	pods, err := getRawReplicationControllerPods(client, rc.Name, namespace)
	if err != nil {
		return nil, err
	}

	podInfo := common.GetPodInfo(rc.Status.Replicas, rc.Spec.Replicas, pods)
	return &podInfo, nil
}
