// Copyright 2017 The Kubernetes Authors.
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
	"context"
	"log"

	v1 "k8s.io/api/core/v1"
	client "k8s.io/client-go/kubernetes"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/errors"
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
)

// NodeList contains a list of nodes in the cluster.
type NodeList struct {
	ListMeta          api.ListMeta       `json:"listMeta"`
	Nodes             []Node             `json:"nodes"`
	CumulativeMetrics []metricapi.Metric `json:"cumulativeMetrics"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

// Node is a presentation layer view of Kubernetes nodes. This means it is node plus additional
// augmented data we can get from other sources.
type Node struct {
	ObjectMeta         api.ObjectMeta         `json:"objectMeta"`
	TypeMeta           api.TypeMeta           `json:"typeMeta"`
	Ready              v1.ConditionStatus     `json:"ready"`
	AllocatedResources NodeAllocatedResources `json:"allocatedResources"`
}

// GetNodeList returns a list of all Nodes in the cluster.
func GetNodeList(client client.Interface, dsQuery *dataselect.DataSelectQuery, metricClient metricapi.MetricClient) (*NodeList, error) {
	nodes, err := client.CoreV1().Nodes().List(context.TODO(), api.ListEverything)

	nonCriticalErrors, criticalError := errors.HandleError(err)
	if criticalError != nil {
		return nil, criticalError
	}

	return toNodeList(client, nodes.Items, nonCriticalErrors, dsQuery, metricClient), nil
}

func toNodeList(client client.Interface, nodes []v1.Node, nonCriticalErrors []error, dsQuery *dataselect.DataSelectQuery,
	metricClient metricapi.MetricClient) *NodeList {
	nodeList := &NodeList{
		Nodes:    make([]Node, 0),
		ListMeta: api.ListMeta{TotalItems: len(nodes)},
		Errors:   nonCriticalErrors,
	}

	nodeCells, metricPromises, filteredTotal := dataselect.GenericDataSelectWithFilterAndMetrics(toCells(nodes),
		dsQuery, metricapi.NoResourceCache, metricClient)
	nodes = fromCells(nodeCells)
	nodeList.ListMeta = api.ListMeta{TotalItems: filteredTotal}

	for _, node := range nodes {
		pods, err := getNodePods(client, node)
		if err != nil {
			log.Printf("Couldn't get pods of %s node: %s\n", node.Name, err)
		}

		nodeList.Nodes = append(nodeList.Nodes, toNode(node, pods))
	}

	cumulativeMetrics, err := metricPromises.GetMetrics()
	nodeList.CumulativeMetrics = cumulativeMetrics
	if err != nil {
		nodeList.CumulativeMetrics = make([]metricapi.Metric, 0)
	}

	return nodeList
}

func toNode(node v1.Node, pods *v1.PodList) Node {
	allocatedResources, err := getNodeAllocatedResources(node, pods)
	if err != nil {
		log.Printf("Couldn't get allocated resources of %s node: %s\n", node.Name, err)
	}

	return Node{
		ObjectMeta:         api.NewObjectMeta(node.ObjectMeta),
		TypeMeta:           api.NewTypeMeta(api.ResourceKindNode),
		Ready:              getNodeConditionStatus(node, v1.NodeReady),
		AllocatedResources: allocatedResources,
	}
}

func getNodeConditionStatus(node v1.Node, conditionType v1.NodeConditionType) v1.ConditionStatus {
	for _, condition := range node.Status.Conditions {
		if condition.Type == conditionType {
			return condition.Status
		}
	}
	return v1.ConditionUnknown
}
