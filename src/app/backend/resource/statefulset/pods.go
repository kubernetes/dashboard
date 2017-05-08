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

package statefulset

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/client"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/pod"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	k8sClient "k8s.io/client-go/kubernetes"
	api "k8s.io/client-go/pkg/api/v1"
	apps "k8s.io/client-go/pkg/apis/apps/v1beta1"
)

// GetStatefulSetPods return list of pods targeting pet set.
func GetStatefulSetPods(client *k8sClient.Clientset, heapsterClient client.HeapsterClient,
	dsQuery *dataselect.DataSelectQuery, name, namespace string) (*pod.PodList, error) {

	log.Printf("Getting replication controller %s pods in namespace %s", name, namespace)

	pods, err := getRawStatefulSetPods(client, name, namespace)
	if err != nil {
		return nil, err
	}

	podList := pod.CreatePodList(pods, []api.Event{}, dsQuery, heapsterClient)
	return &podList, nil
}

// getRawStatefulSetPods return array of api pods targeting pet set with given name.
func getRawStatefulSetPods(client *k8sClient.Clientset, name, namespace string) ([]api.Pod, error) {

	statefulSet, err := client.AppsV1beta1().StatefulSets(namespace).Get(name,
		metaV1.GetOptions{})
	if err != nil {
		return nil, err
	}

	channels := &common.ResourceChannels{
		PodList: common.GetPodListChannel(client, common.NewSameNamespaceQuery(namespace),
			1),
	}

	podList := <-channels.PodList.List
	if err := <-channels.PodList.Error; err != nil {
		return nil, err
	}

	return common.FilterPodsByOwnerReference(statefulSet.Namespace, statefulSet.UID,
		podList.Items), nil
}

// Returns simple info about pods(running, desired, failing, etc.) related to given pet set.
func getStatefulSetPodInfo(client *k8sClient.Clientset, statefulSet *apps.StatefulSet) (
	*common.PodInfo, error) {

	pods, err := getRawStatefulSetPods(client, statefulSet.Name, statefulSet.Namespace)
	if err != nil {
		return nil, err
	}

	podInfo := common.GetPodInfo(statefulSet.Status.Replicas, *statefulSet.Spec.Replicas, pods)
	return &podInfo, nil
}
