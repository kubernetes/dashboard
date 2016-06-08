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

	"github.com/kubernetes/dashboard/resource/common"
	"k8s.io/kubernetes/pkg/api"
	client "k8s.io/kubernetes/pkg/client/unversioned"
	"k8s.io/kubernetes/pkg/fields"
	"k8s.io/kubernetes/pkg/labels"
)

// NodeList contains a list of nodes in the cluster.
type NodeList struct {
	// Unordered list of Nodes.
	Nodes []Node `json:"nodes"`
}

// Node is a presentation layer view of Kubernetes nodes. This means it is node plus additional
// augumented data we can get from other sources.
type Node struct {
	ObjectMeta common.ObjectMeta `json:"objectMeta"`
	TypeMeta   common.TypeMeta   `json:"typeMeta"`

	// Container images of the node.
	ContainerImages []string `json:"containerImages"`

	// External ID of the node assigned by some machine database (e.g. a cloud provider).
	ExternalID string `json:"externalID"`

	// PodCIDR represents the pod IP range assigned to the node.
	PodCIDR string `json:"podCIDR"`

	// ID of the node assigned by the cloud provider.
	ProviderID string `json:"providerID"`

	// Unschedulable controls node schedulability of new pods. By default node is schedulable.
	Unschedulable bool `json:"unschedulable"`
}

// GetNodeList returns a list of all Nodes in the cluster.
func GetNodeList(client client.Interface) (*NodeList, error) {
	log.Printf("Getting list of all nodes in the cluster")

	nodes, err := client.Nodes().List(api.ListOptions{
		LabelSelector: labels.Everything(),
		FieldSelector: fields.Everything(),
	})

	if err != nil {
		return nil, err
	}

	return ToNodeList(nodes.Items), nil
}

func ToNodeList(nodes []api.Node) *NodeList {
	nodeList := &NodeList{
		Nodes: make([]Node, 0),
	}

	for _, node := range nodes {
		nodeList.Nodes = append(nodeList.Nodes, ToNode(node))
	}

	return nodeList
}

func ToNode(node api.Node) Node {
	return Node{
		ObjectMeta:      common.NewObjectMeta(node.ObjectMeta),
		TypeMeta:        common.NewTypeMeta(common.ResourceKindNode),
		ContainerImages: getContainerImages(node),
		ExternalID:      node.Spec.ExternalID,
		ProviderID:      node.Spec.ProviderID,
		PodCIDR:         node.Spec.PodCIDR,
		Unschedulable:   node.Spec.Unschedulable,
	}
}
