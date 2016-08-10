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

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"k8s.io/kubernetes/pkg/api"
	client "k8s.io/kubernetes/pkg/client/unversioned"
	"k8s.io/kubernetes/pkg/fields"
	"k8s.io/kubernetes/pkg/labels"
)

// NodeList contains a list of nodes in the cluster.
type NodeList struct {
	ListMeta common.ListMeta `json:"listMeta"`

	// Unordered list of Nodes.
	Nodes []Node `json:"nodes"`
}

// Node is a presentation layer view of Kubernetes nodes. This means it is node plus additional
// augmented data we can get from other sources.
type Node struct {
	ObjectMeta common.ObjectMeta `json:"objectMeta"`
	TypeMeta   common.TypeMeta   `json:"typeMeta"`

	// Ready Status of the node
	Ready api.ConditionStatus `json:"ready"`
}

// GetNodeList returns a list of all Nodes in the cluster.
func GetNodeList(client client.Interface, dsQuery *common.DataSelectQuery) (*NodeList, error) {
	log.Printf("Getting list of all nodes in the cluster")

	nodes, err := client.Nodes().List(api.ListOptions{
		LabelSelector: labels.Everything(),
		FieldSelector: fields.Everything(),
	})

	if err != nil {
		return nil, err
	}

	return toNodeList(nodes.Items, dsQuery), nil
}

func toNodeList(nodes []api.Node, dsQuery *common.DataSelectQuery) *NodeList {
	nodeList := &NodeList{
		Nodes:    make([]Node, 0),
		ListMeta: common.ListMeta{TotalItems: len(nodes)},
	}

	nodes = fromCells(common.GenericDataSelect(toCells(nodes), dsQuery))

	for _, node := range nodes {
		nodeList.Nodes = append(nodeList.Nodes, toNode(node))
	}

	return nodeList
}

func toNode(node api.Node) Node {
	return Node{
		ObjectMeta: common.NewObjectMeta(node.ObjectMeta),
		TypeMeta:   common.NewTypeMeta(common.ResourceKindNode),
		Ready:      getNodeConditionStatus(node, api.NodeReady),
	}
}

// Returns the status (True, False, Unknown) of a particular NodeConditionType
func getNodeConditionStatus(node api.Node, conditionType api.NodeConditionType) api.ConditionStatus {
	for _, condition := range node.Status.Conditions {
		if condition.Type == conditionType {
			return condition.Status
		}
	}
	return api.ConditionUnknown
}
