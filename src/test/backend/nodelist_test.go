package main

import (
	"k8s.io/kubernetes/pkg/api"
	"reflect"
	"testing"
)

func TestGetNodeList(t *testing.T) {
	node := api.Node{
		ObjectMeta: api.ObjectMeta{
			Name: "Test",
			Labels: map[string]string{
				"label": "value",
			},
		},
		Spec: api.NodeSpec{},
		Status: api.NodeStatus{
			Conditions: []api.NodeCondition{
				{
					Status: "True",
					Type:   "Ready",
				},
			},
		},
	}
	cases := []struct {
		nodes    []api.Node
		expected *NodeList
	}{
		{nil, &NodeList{Nodes: []Node{}}},
		{[]api.Node{node}, &NodeList{Nodes: []Node{
			Node{
				Name:    node.ObjectMeta.Name,
				Labels:  node.ObjectMeta.Labels,
				Status:  "Ready",
				Created: node.ObjectMeta.CreationTimestamp,
			},
		}}},
	}

	for _, c := range cases {
		actual := getNodeList(c.nodes)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getNodeList(%#v) == %#v, expected %#v",
				c.nodes, actual, c.expected)
		}
	}
}
