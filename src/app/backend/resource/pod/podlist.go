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

package pod

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/client"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"

	"k8s.io/kubernetes/pkg/api"
	k8sClient "k8s.io/kubernetes/pkg/client/unversioned"
)

// ReplicationSetList contains a list of Pods in the cluster.
type PodList struct {
	// Unordered list of Pods.
	Pods []Pod `json:"pods"`
}

// Pod is a presentation layer view of Kubernetes Pod resource. This means
// it is Pod plus additional augumented data we can get from other sources
// (like services that target it).
type Pod struct {
	ObjectMeta common.ObjectMeta `json:"objectMeta"`
	TypeMeta   common.TypeMeta   `json:"typeMeta"`

	// Status of the Pod. See Kubernetes API for reference.
	PodPhase api.PodPhase `json:"podPhase"`

	// IP address of the Pod.
	PodIP string `json:"podIP"`

	// Count of containers restarts.
	RestartCount int32 `json:"restartCount"`

	// Pod metrics.
	Metrics *PodMetrics `json:"metrics"`
}

// GetPodList returns a list of all Pods in the cluster.
func GetPodList(client k8sClient.Interface, heapsterClient client.HeapsterClient,
	nsQuery *common.NamespaceQuery) (*PodList, error) {
	log.Printf("Getting list of all pods in the cluster")

	channels := &common.ResourceChannels{
		PodList: common.GetPodListChannel(client, nsQuery, 1),
	}

	return GetPodListFromChannels(channels, heapsterClient)
}

// GetPodList returns a list of all Pods in the cluster
// reading required resource list once from the channels.
func GetPodListFromChannels(channels *common.ResourceChannels, heapsterClient client.HeapsterClient) (
	*PodList, error) {

	pods := <-channels.PodList.List
	if err := <-channels.PodList.Error; err != nil {
		return nil, err
	}

	podList := CreatePodList(pods.Items, heapsterClient)
	return &podList, nil
}

func CreatePodList(pods []api.Pod, heapsterClient client.HeapsterClient) PodList {
	metrics, err := getPodMetrics(pods, heapsterClient)
	if err != nil {
		log.Printf("Skipping Heapster metrics because of error: %s\n", err)
	}

	podList := PodList{
		Pods: make([]Pod, 0),
	}

	for _, pod := range pods {
		podDetail := ToPod(&pod, metrics)
		podList.Pods = append(podList.Pods, podDetail)
	}

	return podList
}
