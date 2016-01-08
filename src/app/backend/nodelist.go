package main

import (
	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/api/unversioned"
	client "k8s.io/kubernetes/pkg/client/unversioned"
	"k8s.io/kubernetes/pkg/fields"
	"k8s.io/kubernetes/pkg/labels"
)

type NodeList struct {
	// Unordered list of Nodes
	Nodes []Node `json:"nodes"`
}

type Node struct {
	// Name of the Node
	Name string `json:"name"`

	// Labels of the Node
	Labels map[string]string `json:"labels"`

	// Current status of the Node
	Status string `json:"status"`

	// Creation timestamp
	Created unversioned.Time `json:"created"`
}

// Returns a list of all Nodes in the cluster.
func GetNodeList(client *client.Client) (*NodeList, error) {
	nodes, err := client.Nodes().List(
		unversioned.ListOptions{
			LabelSelector: unversioned.LabelSelector{labels.Everything()},
			FieldSelector: unversioned.FieldSelector{fields.Everything()},
		})

	if err != nil {
		return nil, err
	}

	return getNodeList(nodes.Items), nil
}

func getNodeList(nodes []api.Node) *NodeList {
	nodeList := &NodeList{Nodes: make([]Node, 0)}

	for _, node := range nodes {
		var condition api.NodeCondition
		// find node status
		for _, c := range node.Status.Conditions {
			if c.Status == "True" {
				condition = c
				break
			}
		}

		nodeList.Nodes = append(nodeList.Nodes, Node{
			Name:    node.ObjectMeta.Name,
			Labels:  node.ObjectMeta.Labels,
			Status:  string(condition.Type),
			Created: node.ObjectMeta.CreationTimestamp,
		})
	}

	return nodeList
}
