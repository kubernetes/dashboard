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

	heapster "github.com/kubernetes/dashboard/src/app/backend/client"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/metric"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/fields"
	"k8s.io/apimachinery/pkg/labels"
	client "k8s.io/client-go/kubernetes"
	api "k8s.io/client-go/pkg/api/v1"
)

// NodeList contains a list of nodes in the cluster.
type NodeList struct {
	ListMeta common.ListMeta `json:"listMeta"`

	// Unordered list of Nodes.
	Nodes             []Node          `json:"nodes"`
	CumulativeMetrics []metric.Metric `json:"cumulativeMetrics"`
}

// Node is a presentation layer view of Kubernetes nodes. This means it is node plus additional
// augmented data we can get from other sources.
type Node struct {
	ObjectMeta common.ObjectMeta `json:"objectMeta"`
	TypeMeta   common.TypeMeta   `json:"typeMeta"`

	// Ready Status of the node
	Ready api.ConditionStatus `json:"ready"`
}

// GetNodeListFromChannels returns a list of all Nodes in the cluster.
func GetNodeListFromChannels(channels *common.ResourceChannels, dsQuery *dataselect.DataSelectQuery,
	heapsterClient *heapster.HeapsterClient) (*NodeList, error) {
	log.Print("Getting node list")

	nodes := <-channels.NodeList.List
	if err := <-channels.NodeList.Error; err != nil {
		return nil, err
	}

	return toNodeList(nodes.Items, dsQuery, heapsterClient), nil
}

// GetNodeList returns a list of all Nodes in the cluster.
func GetNodeList(client client.Interface, dsQuery *dataselect.DataSelectQuery, heapsterClient *heapster.HeapsterClient) (*NodeList, error) {
	log.Print("Getting list of all nodes in the cluster")

	nodes, err := client.CoreV1().Nodes().List(metaV1.ListOptions{
		LabelSelector: labels.Everything().String(),
		FieldSelector: fields.Everything().String(),
	})

	if err != nil {
		return nil, err
	}

	return toNodeList(nodes.Items, dsQuery, heapsterClient), nil
}

func toNodeList(nodes []api.Node, dsQuery *dataselect.DataSelectQuery, heapsterClient *heapster.HeapsterClient) *NodeList {
	nodeList := &NodeList{
		Nodes:    make([]Node, 0),
		ListMeta: common.ListMeta{TotalItems: len(nodes)},
	}

	nodeCells, metricPromises, filteredTotal := dataselect.GenericDataSelectWithFilterAndMetrics(toCells(nodes), dsQuery, dataselect.NoResourceCache, heapsterClient)
	nodes = fromCells(nodeCells)
	nodeList.ListMeta = common.ListMeta{TotalItems: filteredTotal}

	for _, node := range nodes {
		nodeList.Nodes = append(nodeList.Nodes, toNode(node))
	}

	// this may be slow because heapster does not support all in one download for nodes.
	cumulativeMetrics, err := metricPromises.GetMetrics()
	nodeList.CumulativeMetrics = cumulativeMetrics
	if err != nil {
		nodeList.CumulativeMetrics = make([]metric.Metric, 0)
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
