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

package replicasetdetail

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/client"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/pod"

	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/apis/extensions"
	k8sClient "k8s.io/kubernetes/pkg/client/clientset_generated/internalclientset"
	"k8s.io/kubernetes/pkg/fields"
	"k8s.io/kubernetes/pkg/labels"
)

// GetReplicaSetPods return list of pods targeting replica set.
func GetReplicaSetPods(client k8sClient.Interface, heapsterClient client.HeapsterClient,
	dsQuery *dataselect.DataSelectQuery, petSetName, namespace string) (*pod.PodList, error) {
	log.Printf("Getting replication controller %s pods in namespace %s", petSetName, namespace)

	pods, err := getRawReplicaSetPods(client, petSetName, namespace)
	if err != nil {
		return nil, err
	}

	podList := pod.CreatePodList(pods, []api.Event{}, dsQuery, heapsterClient)
	return &podList, nil
}

// Returns array of api pods targeting replica set with given name.
func getRawReplicaSetPods(client k8sClient.Interface, petSetName, namespace string) (
	[]api.Pod, error) {

	replicaSet, err := client.Extensions().ReplicaSets(namespace).Get(petSetName)
	if err != nil {
		return nil, err
	}

	labelSelector := labels.SelectorFromSet(replicaSet.Spec.Selector.MatchLabels)
	channels := &common.ResourceChannels{
		PodList: common.GetPodListChannelWithOptions(client, common.NewSameNamespaceQuery(namespace),
			api.ListOptions{
				LabelSelector: labelSelector,
				FieldSelector: fields.Everything(),
			}, 1),
	}

	podList := <-channels.PodList.List
	if err := <-channels.PodList.Error; err != nil {
		return nil, err
	}

	return podList.Items, nil
}

// Returns simple info about pods(running, desired, failing, etc.) related to given replica set.
func getReplicaSetPodInfo(client k8sClient.Interface, replicaSet *extensions.ReplicaSet) (
	*common.PodInfo, error) {

	labelSelector := labels.SelectorFromSet(replicaSet.Spec.Selector.MatchLabels)
	channels := &common.ResourceChannels{
		PodList: common.GetPodListChannelWithOptions(client, common.NewSameNamespaceQuery(
			replicaSet.Namespace),
			api.ListOptions{
				LabelSelector: labelSelector,
				FieldSelector: fields.Everything(),
			}, 1),
	}

	pods := <-channels.PodList.List
	if err := <-channels.PodList.Error; err != nil {
		return nil, err
	}

	podInfo := common.GetPodInfo(replicaSet.Status.Replicas, replicaSet.Spec.Replicas, pods.Items)
	return &podInfo, nil
}
