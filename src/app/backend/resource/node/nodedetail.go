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

package node

import (
	"log"

	"github.com/kubernetes/dashboard/client"
	"github.com/kubernetes/dashboard/resource/common"
	"github.com/kubernetes/dashboard/resource/event"
	"github.com/kubernetes/dashboard/resource/pod"
	"k8s.io/kubernetes/pkg/api"
	k8sClient "k8s.io/kubernetes/pkg/client/unversioned"
	"k8s.io/kubernetes/pkg/fields"
)

// NodeDetail is a presentation layer view of Kubernetes Node resource. This means it is Node plus
// additional augmented data we can get from other sources.
type NodeDetail struct {
	ObjectMeta common.ObjectMeta `json:"objectMeta"`
	TypeMeta   common.TypeMeta   `json:"typeMeta"`

	// NodePhase is the current lifecycle phase of the node.
	Phase api.NodePhase `json:"phase"`

	// CPU limit specified (core number).
	CPUCapacity int64 `json:"cpuCapacity"`

	// Memory limit specified (bytes).
	MemoryCapacity int64 `json:"memoryCapacity"`

	// Pod limit specified (number).
	PodCapacity int64 `json:"podCapacity"`

	// External ID of the node assigned by some machine database (e.g. a cloud provider).
	ExternalID string `json:"externalID"`

	// PodCIDR represents the pod IP range assigned to the node.
	PodCIDR string `json:"podCIDR"`

	// ID of the node assigned by the cloud provider.
	ProviderID string `json:"providerID"`

	// Unschedulable controls node schedulability of new pods. By default node is schedulable.
	Unschedulable bool `json:"unschedulable"`

	// Set of ids/uuids to uniquely identify the node.
	NodeInfo api.NodeSystemInfo `json:"nodeInfo"`

	// Conditions is an array of current node conditions.
	Conditions []api.NodeCondition `json:"conditions"`

	// Container images of the node.
	ContainerImages []string `json:"containerImages"`

	// PodList contains information about pods belonging to this node.
	PodList pod.PodList `json:"podList"`

	// Events is list of events associated to the node.
	EventList common.EventList `json:"eventList"`
}

// GetNodeDetail gets node details.
func GetNodeDetail(client k8sClient.Interface, heapsterClient client.HeapsterClient, name string) (
	*NodeDetail, error) {
	log.Printf("Getting details of %s node", name)

	node, err := client.Nodes().Get(name)
	if err != nil {
		return nil, err
	}

	pods, err := getNodePods(client, heapsterClient, *node)
	if err != nil {
		return nil, err
	}

	events, err := event.GetNodeEvents(client, node.Name)
	if err != nil {
		return nil, err
	}

	nodeDetails := toNodeDetail(*node, pods, events)
	return &nodeDetails, nil
}

func getNodePods(client k8sClient.Interface, heapsterClient client.HeapsterClient,
	node api.Node) (pod.PodList, error) {

	fieldSelector, err := fields.ParseSelector("spec.nodeName=" + node.Name +
		",status.phase!=" + string(api.PodSucceeded) +
		",status.phase!=" + string(api.PodFailed))

	if err != nil {
		return pod.PodList{}, err
	}

	pods, err := client.Pods(api.NamespaceAll).List(api.ListOptions{
		FieldSelector: fieldSelector,
	})

	if err != nil {
		return pod.PodList{}, err
	}

	return pod.CreatePodList(pods.Items, heapsterClient), nil
}

func toNodeDetail(node api.Node, pods pod.PodList, eventList common.EventList) NodeDetail {
	cpuCapacity, _ := node.Status.Capacity.Cpu().AsInt64()
	memoryCapacity, _ := node.Status.Capacity.Memory().AsInt64()
	podCapacity, _ := node.Status.Capacity.Pods().AsInt64()

	return NodeDetail{
		ObjectMeta:      common.NewObjectMeta(node.ObjectMeta),
		TypeMeta:        common.NewTypeMeta(common.ResourceKindNode),
		Phase:           node.Status.Phase,
		CPUCapacity:     cpuCapacity,
		MemoryCapacity:  memoryCapacity,
		PodCapacity:     podCapacity,
		ExternalID:      node.Spec.ExternalID,
		ProviderID:      node.Spec.ProviderID,
		PodCIDR:         node.Spec.PodCIDR,
		Unschedulable:   node.Spec.Unschedulable,
		NodeInfo:        node.Status.NodeInfo,
		Conditions:      node.Status.Conditions,
		ContainerImages: getContainerImages(node),
		PodList:         pods,
		EventList:       eventList,
	}
}
