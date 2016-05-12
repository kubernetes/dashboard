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

package replicaset

import (
	"log"

	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/apis/extensions"
	k8sClient "k8s.io/kubernetes/pkg/client/unversioned"

	"github.com/kubernetes/dashboard/client"
	"github.com/kubernetes/dashboard/resource/common"
	"github.com/kubernetes/dashboard/resource/pod"
	"github.com/kubernetes/dashboard/resource/replicationcontroller"
)

// ReplicaSetDetail is a presentation layer view of Kubernetes Replica Set resource. This means
// it is Replica Set plus additional augmented data we can get from other sources
// (like services that target the same pods).
type ReplicaSetDetail struct {
	ObjectMeta common.ObjectMeta `json:"objectMeta"`
	TypeMeta   common.TypeMeta   `json:"typeMeta"`

	// Aggregate information about pods belonging to this Replica Set.
	PodInfo common.PodInfo `json:"podInfo"`

	// Detailed information about Pods belonging to this Replica Set.
	PodList pod.PodList `json:"podList"`

	// Container images of the Replica Set.
	ContainerImages []string `json:"containerImages"`

	// List of events related to this Replica Set.
	EventList common.EventList `json:"eventList"`
}

// GetReplicaSetDetail gets replica set details.
func GetReplicaSetDetail(client k8sClient.Interface, heapsterClient client.HeapsterClient,
	namespace, name string) (*ReplicaSetDetail, error) {

	log.Printf("Getting details of %s service in %s namespace", name, namespace)

	// TODO(floreks): Use channels.
	replicaSetData, err := client.Extensions().ReplicaSets(namespace).Get(name)
	if err != nil {
		return nil, err
	}

	channels := &common.ResourceChannels{
		PodList: common.GetPodListChannel(client, 1),
	}

	pods := <-channels.PodList.List
	if err := <-channels.PodList.Error; err != nil {
		return nil, err
	}

	events, err := GetReplicaSetEvents(client, replicaSetData.Namespace, replicaSetData.Name)
	if err != nil {
		return nil, err
	}

	replicaSet := getReplicaSetDetail(replicaSetData, heapsterClient, events, pods.Items)
	return &replicaSet, nil
}

func getReplicaSetDetail(replicaSet *extensions.ReplicaSet, heapsterClient client.HeapsterClient,
	events *common.EventList, pods []api.Pod) ReplicaSetDetail {

	matchingPods := common.FilterNamespacedPodsBySelector(pods, replicaSet.ObjectMeta.Namespace,
		replicaSet.Spec.Selector.MatchLabels)

	podInfo := getPodInfo(replicaSet, matchingPods)

	return ReplicaSetDetail{
		ObjectMeta:      common.NewObjectMeta(replicaSet.ObjectMeta),
		TypeMeta:        common.NewTypeMeta(common.ResourceKindReplicaSet),
		ContainerImages: replicationcontroller.GetContainerImages(&replicaSet.Spec.Template.Spec),
		PodInfo:         podInfo,
		PodList:         pod.CreatePodList(matchingPods, heapsterClient),
		EventList:       *events,
	}
}
