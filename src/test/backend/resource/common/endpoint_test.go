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

package common

import (
	"reflect"
	"testing"

	"k8s.io/kubernetes/pkg/api"
)

func TestGetExternalEndpoints(t *testing.T) {
	labelSelectorMap := make(map[string]string)
	labelSelectorMap["name"] = "app-name"
	cases := []struct {
		selector map[string]string
		pods     []api.Pod
		service  api.Service
		nodes    []api.Node
		expected []Endpoint
	}{
		{
			labelSelectorMap,
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
		actual := GetExternalEndpoints(c.selector, c.pods, c.service, c.nodes)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetExternalEndpoints(%+v, %+v, %+v, %+v) == %+v, expected %+v",
				c.selector, c.pods, c.service, c.nodes, actual, c.expected)
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
		actual := getNodePortEndpoints(c.pods, c.service, c.nodes)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getNodePortEndpoints(%+v, %+v, %+v) == %+v, expected %+v", c.pods, c.service,
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
		actual := getLocalhostEndpoints(c.service)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getLocalhostEndpoints(%+v) == %+v, expected %+v", c.service, actual,
				c.expected)
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
		actual := getExternalEndpoint(c.serviceIp, c.ports)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getExternalEndpoint(%+v, %+v) == %+v, expected %+v",
				c.serviceIp, c.ports, actual, c.expected)
		}
	}
}

func TestGetUniqueExternalAddresses(t *testing.T) {
	cases := []struct {
		addresses []api.NodeAddress
		expected  []api.NodeAddress
	}{
		{[]api.NodeAddress{}, []api.NodeAddress{}},
		{
			[]api.NodeAddress{
				{Address: "127.0.0.1", Type: api.NodeExternalIP},
				{Address: "127.0.0.1", Type: api.NodeExternalIP},
				{Address: "127.0.0.2", Type: api.NodeExternalIP},
			},
			[]api.NodeAddress{
				{Address: "127.0.0.1", Type: api.NodeExternalIP},
				{Address: "127.0.0.2", Type: api.NodeExternalIP},
			},
		},
		{
			[]api.NodeAddress{
				{Address: "127.0.0.1", Type: api.NodeInternalIP},
				{Address: "127.0.0.2", Type: api.NodeExternalIP},
			},
			[]api.NodeAddress{
				{Address: "127.0.0.2", Type: api.NodeExternalIP},
			},
		},
		{
			[]api.NodeAddress{
				{Address: "127.0.0.1", Type: api.NodeInternalIP},
			},
			[]api.NodeAddress{},
		},
	}

	for _, c := range cases {
		actual := getUniqueExternalAddresses(c.addresses)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getUniqueExternalAddresses(%+v) == %+v, expected %+v",
				c.addresses, actual, c.expected)
		}
	}
}
