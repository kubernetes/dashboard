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

package statefulsetdetail

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/client"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/pod"

	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/apis/apps"
	k8sClient "k8s.io/kubernetes/pkg/client/clientset_generated/internalclientset"
)

// GetStatefulSetPods return list of pods targeting pet set.
func GetStatefulSetPods(client *k8sClient.Clientset, heapsterClient client.HeapsterClient,
	dsQuery *dataselect.DataSelectQuery, statefulSetName, namespace string) (*pod.PodList, error) {
	log.Printf("Getting replication controller %s pods in namespace %s", statefulSetName, namespace)

	pods, err := getRawStatefulSetPods(client, statefulSetName, namespace)
	if err != nil {
		return nil, err
	}

	podList := pod.CreatePodList(pods, []api.Event{}, dsQuery, heapsterClient)
	return &podList, nil
}

// Returns array of api pods targeting pet set with given name.
func getRawStatefulSetPods(client *k8sClient.Clientset, statefulSetName, namespace string) (
	[]api.Pod, error) {

	statefulSet, err := client.Apps().StatefulSets(namespace).Get(statefulSetName)
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

	matchingPods := common.FilterNamespacedPodsByLabelSelector(podList.Items,
		statefulSet.ObjectMeta.Namespace, statefulSet.Spec.Selector)
	return matchingPods, nil
}

// Returns simple info about pods(running, desired, failing, etc.) related to given pet set.
func getStatefulSetPodInfo(client *k8sClient.Clientset, statefulSet *apps.StatefulSet) (
	*common.PodInfo, error) {

	pods, err := getRawStatefulSetPods(client, statefulSet.Name, statefulSet.Namespace)
	if err != nil {
		return nil, err
	}

	podInfo := common.GetPodInfo(int32(statefulSet.Status.Replicas), int32(statefulSet.Spec.Replicas), pods)
	return &podInfo, nil
}
