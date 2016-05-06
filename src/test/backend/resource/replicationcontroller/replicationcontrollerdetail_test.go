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

package replicationcontroller

import (
	"reflect"
	"testing"

	. "github.com/kubernetes/dashboard/resource/common"
	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/client/unversioned/testclient"
)

func TestDeleteReplicationControllerServices(t *testing.T) {
	cases := []struct {
		namespace, name           string
		replicationController     *api.ReplicationController
		replicationControllerList *api.ReplicationControllerList
		serviceList               *api.ServiceList
		expectedActions           []string
	}{
		{
			"test-namespace", "test-name",
			&api.ReplicationController{
				Spec: api.ReplicationControllerSpec{Selector: map[string]string{"app": "test"}}},
			&api.ReplicationControllerList{
				Items: []api.ReplicationController{
					{Spec: api.ReplicationControllerSpec{Selector: map[string]string{"app": "test"}}},
				},
			},
			&api.ServiceList{
				Items: []api.Service{
					{Spec: api.ServiceSpec{Selector: map[string]string{"app": "test"}}},
				},
			},
			[]string{"get", "list", "list", "delete"},
		},
		{
			"test-namespace", "test-name",
			&api.ReplicationController{
				Spec: api.ReplicationControllerSpec{Selector: map[string]string{"app": "test"}}},
			&api.ReplicationControllerList{
				Items: []api.ReplicationController{
					{Spec: api.ReplicationControllerSpec{Selector: map[string]string{"app": "test"}}},
					{Spec: api.ReplicationControllerSpec{Selector: map[string]string{"app": "test"}}},
				},
			},
			&api.ServiceList{
				Items: []api.Service{
					{Spec: api.ServiceSpec{Selector: map[string]string{"app": "test"}}},
				},
			},
			[]string{"get", "list"},
		},
		{
			"test-namespace", "test-name",
			&api.ReplicationController{
				Spec: api.ReplicationControllerSpec{Selector: map[string]string{"app": "test"}}},
			&api.ReplicationControllerList{
				Items: []api.ReplicationController{
					{Spec: api.ReplicationControllerSpec{Selector: map[string]string{"app": "test"}}},
				},
			},
			&api.ServiceList{},
			[]string{"get", "list", "list"},
		},
	}

	for _, c := range cases {
		fakeClient := testclient.NewSimpleFake(c.replicationController,
			c.replicationControllerList, c.serviceList)

		DeleteReplicationControllerServices(fakeClient, c.namespace, c.name)

		actions := fakeClient.Actions()
		if len(actions) != len(c.expectedActions) {
			t.Errorf("Unexpected actions: %v, expected %d actions got %d", actions,
				len(c.expectedActions), len(actions))
			continue
		}

		for i, verb := range c.expectedActions {
			if actions[i].GetVerb() != verb {
				t.Errorf("Unexpected action: %+v, expected %s",
					actions[i], verb)
			}
		}
	}
}

func TestUpdateReplicasCount(t *testing.T) {
	cases := []struct {
		namespace, replicationControllerName string
		replicationControllerSpec            *ReplicationControllerSpec
		expected                             int
		expectedActions                      []string
	}{
		{
			"default-ns", "replicationController-1",
			&ReplicationControllerSpec{Replicas: 5},
			5,
			[]string{"get", "update"},
		},
	}

	for _, c := range cases {
		replicationCtrl := &api.ReplicationController{}
		fakeClient := testclient.NewSimpleFake(replicationCtrl)

		UpdateReplicasCount(fakeClient, c.namespace, c.replicationControllerName, c.replicationControllerSpec)

		actual := fakeClient.Actions()[1].(testclient.UpdateAction).GetObject().(*api.ReplicationController)
		if actual.Spec.Replicas != c.expected {
			t.Errorf("UpdateReplicasCount(client, %+v, %+v, %+v). Got %+v, expected %+v",
				c.namespace, c.replicationControllerName, c.replicationControllerSpec, actual.Spec.Replicas, c.expected)
		}

		actions := fakeClient.Actions()
		if len(actions) != len(c.expectedActions) {
			t.Errorf("Unexpected actions: %v, expected %d actions got %d", actions,
				len(c.expectedActions), len(actions))
			continue
		}

		for i, verb := range c.expectedActions {
			if actions[i].GetResource() != "replicationcontrollers" {
				t.Errorf("Unexpected action: %+v, expected %s-replicationController",
					actions[i], verb)
			}
			if actions[i].GetVerb() != verb {
				t.Errorf("Unexpected action: %+v, expected %s-replicationController",
					actions[i], verb)
			}
		}

	}
}

func TestGetServicePortsName(t *testing.T) {
	cases := []struct {
		ports    []api.ServicePort
		expected []ServicePort
	}{
		{nil, nil},
		{[]api.ServicePort{}, nil},
		{[]api.ServicePort{{Name: "foo", Port: 8080, Protocol: "TCP"}},
			[]ServicePort{{Port: 8080, Protocol: "TCP"}}},
		{[]api.ServicePort{{Name: "foo", Port: 8080, Protocol: "TCP"},
			{Name: "foo", Port: 9191, Protocol: "UDP"}},
			[]ServicePort{{Port: 8080, Protocol: "TCP"}, {Port: 9191, Protocol: "UDP"}}},
	}
	for _, c := range cases {
		actual := GetServicePorts(c.ports)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getServicePortsName(%+v) == %+v, expected %+v", c.ports, actual, c.expected)
		}
	}
}

func TestGetExternalEndpoint(t *testing.T) {
	cases := []struct {
		serviceIp api.LoadBalancerIngress
		ports     []api.ServicePort
		expected  Endpoint
	}{
		{api.LoadBalancerIngress{IP: "127.0.0.1"}, nil, Endpoint{Host: "127.0.0.1"}},
		{api.LoadBalancerIngress{IP: "127.0.0.1", Hostname: "host"}, nil, Endpoint{Host: "host"}},
		{api.LoadBalancerIngress{IP: "127.0.0.1"},
			[]api.ServicePort{{Name: "foo", Port: 8080, Protocol: "TCP"}},
			Endpoint{Host: "127.0.0.1", Ports: []ServicePort{{Port: 8080, Protocol: "TCP"}}}},
	}
	for _, c := range cases {
		actual := GetExternalEndpoint(c.serviceIp, c.ports)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetExternalEndpoint(%+v, %+v) == %+v, expected %+v",
				c.serviceIp, c.ports, actual, c.expected)
		}
	}
}

func TestIsExternalIPUniqe(t *testing.T) {
	cases := []struct {
		externalIPs []string
		externalIP  string
		expected    bool
	}{
		{
			[]string{"127.0.0.1", "192.168.1.1"},
			"172.0.0.1",
			true,
		},
		{
			[]string{"127.0.0.1", "192.168.1.1", "172.0.0.1"},
			"172.0.0.1",
			false,
		},
		{
			[]string{},
			"172.0.0.1",
			true,
		},
	}
	for _, c := range cases {
		actual := isExternalIPUniqe(c.externalIPs, c.externalIP)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("isExternalIPUniqe(%+v, %+v) == %+v, expected %+v", c.externalIPs,
				c.externalIP, actual, c.expected)
		}
	}
}

func TestFilterReplicationControllerPods(t *testing.T) {
	firstLabelSelectorMap := make(map[string]string)
	firstLabelSelectorMap["name"] = "app-name-first"
	secondLabelSelectorMap := make(map[string]string)
	secondLabelSelectorMap["name"] = "app-name-second"
	cases := []struct {
		replicationController api.ReplicationController
		pods                  []api.Pod
		expected              []api.Pod
	}{
		{
			api.ReplicationController{
				Spec: api.ReplicationControllerSpec{
					Selector: firstLabelSelectorMap,
				},
			},
			[]api.Pod{
				{
					ObjectMeta: api.ObjectMeta{
						Name:   "first-pod-ok",
						Labels: firstLabelSelectorMap,
					},
				},
				{
					ObjectMeta: api.ObjectMeta{
						Name:   "second-pod-ok",
						Labels: firstLabelSelectorMap,
					},
				},
				{
					ObjectMeta: api.ObjectMeta{
						Name:   "third-pod-wrong",
						Labels: secondLabelSelectorMap,
					},
				},
			},
			[]api.Pod{
				{
					ObjectMeta: api.ObjectMeta{
						Name:   "first-pod-ok",
						Labels: firstLabelSelectorMap,
					},
				},
				{
					ObjectMeta: api.ObjectMeta{
						Name:   "second-pod-ok",
						Labels: firstLabelSelectorMap,
					},
				},
			},
		},
	}
	for _, c := range cases {
		actual := filterReplicationControllerPods(c.replicationController, c.pods)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getExternalEndpoints(%+v, %+v) == %+v, expected %+v",
				c.replicationController, c.pods, actual, c.expected)
		}
	}
}

func TestGetExternalEndpoints(t *testing.T) {
	labelSelectorMap := make(map[string]string)
	labelSelectorMap["name"] = "app-name"
	cases := []struct {
		replicationController api.ReplicationController
		pods                  []api.Pod
		service               api.Service
		nodes                 []api.Node
		expected              []Endpoint
	}{
		{
			api.ReplicationController{
				Spec: api.ReplicationControllerSpec{
					Selector: labelSelectorMap,
				},
			},
			[]api.Pod{
				{
					Spec: api.PodSpec{
						NodeName: "node",
					},
					ObjectMeta: api.ObjectMeta{
						Labels: labelSelectorMap,
					},
				},
			},
			api.Service{
				Spec: api.ServiceSpec{
					Type: api.ServiceTypeNodePort,
					Ports: []api.ServicePort{
						{
							Protocol: "TCP",
							NodePort: 30100,
						},
						{
							Protocol: "TCP",
							NodePort: 30101,
						},
					},
				},
			},
			[]api.Node{{
				ObjectMeta: api.ObjectMeta{
					Name: "node",
				},
				Status: api.NodeStatus{
					Addresses: []api.NodeAddress{
						{
							Type:    api.NodeExternalIP,
							Address: "192.168.1.108",
						},
					},
				},
			}},
			[]Endpoint{
				{
					Host: "192.168.1.108",
					Ports: []ServicePort{
						{
							Port: 30100, Protocol: "TCP",
						},
					},
				},
				{
					Host: "192.168.1.108",
					Ports: []ServicePort{
						{
							Port: 30101, Protocol: "TCP",
						},
					},
				},
			},
		},
	}
	for _, c := range cases {
		actual := getExternalEndpoints(c.replicationController, c.pods, c.service, c.nodes)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getExternalEndpoints(%+v, %+v, %+v, %+v) == %+v, expected %+v",
				c.replicationController, c.pods, c.service, c.nodes, actual, c.expected)
		}
	}
}

func TestGetNodePortEndpoints(t *testing.T) {
	cases := []struct {
		pods     []api.Pod
		service  api.Service
		nodes    []api.Node
		expected []Endpoint
	}{
		{
			[]api.Pod{
				{
					Status: api.PodStatus{
						HostIP: "192.168.1.108",
					},
				},
				{
					Status: api.PodStatus{
						HostIP: "192.168.1.108",
					},
				},
				{
					Status: api.PodStatus{
						HostIP: "192.168.1.109",
					},
				},
			},
			api.Service{
				Spec: api.ServiceSpec{
					Type: api.ServiceTypeNodePort,
					Ports: []api.ServicePort{
						{
							Protocol: "TCP",
							NodePort: 30100,
						},
						{
							Protocol: "TCP",
							NodePort: 30101,
						},
					},
				},
			},
			[]api.Node{
				{
					Status: api.NodeStatus{
						Addresses: []api.NodeAddress{
							{
								Type:    api.NodeExternalIP,
								Address: "192.168.1.108",
							},
						},
					},
				},
			},
			[]Endpoint{
				{
					Host: "192.168.1.108",
					Ports: []ServicePort{
						{
							Port: 30100, Protocol: "TCP",
						},
					},
				},
				{
					Host: "192.168.1.108",
					Ports: []ServicePort{
						{
							Port: 30101, Protocol: "TCP",
						},
					},
				},
			},
		},
	}
	for _, c := range cases {
		actual := GetNodePortEndpoints(c.pods, c.service, c.nodes)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetNodePortEndpoints(%+v, %+v, %+v) == %+v, expected %+v", c.pods, c.service,
				c.nodes, actual, c.expected)
		}
	}
}

func TestGetLocalhostEndpoints(t *testing.T) {
	cases := []struct {
		service  api.Service
		expected []Endpoint
	}{
		{
			api.Service{
				Spec: api.ServiceSpec{
					Ports: []api.ServicePort{
						{
							Protocol: "TCP",
							NodePort: 30100,
						},
						{
							Protocol: "TCP",
							NodePort: 30101,
						},
					},
				},
			},
			[]Endpoint{
				{
					Host: "localhost",
					Ports: []ServicePort{
						{
							Port:     30100,
							Protocol: "TCP",
						},
					},
				},
				{
					Host: "localhost",
					Ports: []ServicePort{
						{
							Port:     30101,
							Protocol: "TCP",
						},
					},
				},
			},
		},
	}
	for _, c := range cases {
		actual := GetLocalhostEndpoints(c.service)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetLocalhostEndpoints(%+v) == %+v, expected %+v", c.service, actual,
				c.expected)
		}
	}
}
