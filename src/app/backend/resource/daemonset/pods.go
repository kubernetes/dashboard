// Copyright 2015 Google Inc. All Rights Reserved.
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

	"github.com/kubernetes/dashboard/src/app/backend/client"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/pod"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	k8sClient "k8s.io/client-go/kubernetes"
	api "k8s.io/client-go/pkg/api/v1"
	extensions "k8s.io/client-go/pkg/apis/extensions/v1beta1"
)

// GetDaemonSetPods return list of pods targeting daemon set.
func GetDaemonSetPods(client k8sClient.Interface, heapsterClient client.HeapsterClient,
	dsQuery *dataselect.DataSelectQuery, daemonSetName, namespace string) (*pod.PodList, error) {
	log.Printf("Getting replication controller %s pods in namespace %s", daemonSetName, namespace)

	pods, err := getRawDaemonSetPods(client, daemonSetName, namespace)
	if err != nil {
		return nil, err
	}

	podList := pod.CreatePodList(pods, []api.Event{}, dsQuery, heapsterClient)
	return &podList, nil
}

// Returns array of api pods targeting daemon set with given name.
func getRawDaemonSetPods(client k8sClient.Interface, daemonSetName, namespace string) ([]api.Pod, error) {
	daemonSet, err := client.ExtensionsV1beta1().DaemonSets(namespace).Get(daemonSetName, metaV1.GetOptions{})
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

	matchingPods := common.FilterPodsByOwnerReference(daemonSet.Namespace, daemonSet.UID, podList.Items)
	return matchingPods, nil
}

// Returns simple info about pods(running, desired, failing, etc.) related to given daemon set.
func getDaemonSetPodInfo(client k8sClient.Interface, daemonSet *extensions.DaemonSet) (
	*common.PodInfo, error) {

	pods, err := getRawDaemonSetPods(client, daemonSet.Name, daemonSet.Namespace)
	if err != nil {
		return nil, err
	}

	podInfo := common.GetPodInfo(daemonSet.Status.CurrentNumberScheduled,
		daemonSet.Status.DesiredNumberScheduled, pods)
	return &podInfo, nil
}
