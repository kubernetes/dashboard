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

package main

import (
	"reflect"
	"testing"

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

func TestGetRestartCount(t *testing.T) {
	cases := []struct {
		pod      api.Pod
		expected int
	}{
		{
			api.Pod{}, 0,
		},
		{
			api.Pod{
				Status: api.PodStatus{
					ContainerStatuses: []api.ContainerStatus{
						{
							Name:         "container-1",
							RestartCount: 1,
						},
					},
				},
			},
			1,
		},
		{
			api.Pod{
				Status: api.PodStatus{
					ContainerStatuses: []api.ContainerStatus{
						{
							Name:         "container-1",
							RestartCount: 3,
						},
						{
							Name:         "container-2",
							RestartCount: 2,
						},
					},
				},
			},
			5,
		},
	}
	for _, c := range cases {
		actual := getRestartCount(c.pod)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("AppendEvents(%#v) == %#v, expected %#v", c.pod, actual, c.expected)
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
		actual := getServicePorts(c.ports)
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
		actual := getExternalEndpoint(c.serviceIp, c.ports)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getExternalEndpoint(%+v, %+v) == %+v, expected %+v",
				c.serviceIp, c.ports, actual, c.expected)
		}
	}
}

func TestGetInternalEndpoint(t *testing.T) {
	cases := []struct {
		serviceName, namespace string
		ports                  []api.ServicePort
		expected               Endpoint
	}{
		{"my-service", api.NamespaceDefault, nil, Endpoint{Host: "my-service"}},
		{"my-service", api.NamespaceDefault,
			[]api.ServicePort{{Name: "foo", Port: 8080, Protocol: "TCP"}},
			Endpoint{Host: "my-service", Ports: []ServicePort{{Port: 8080, Protocol: "TCP"}}}},
		{"my-service", "my-namespace", nil, Endpoint{Host: "my-service.my-namespace"}},
		{"my-service", "my-namespace",
			[]api.ServicePort{{Name: "foo", Port: 8080, Protocol: "TCP"}},
			Endpoint{Host: "my-service.my-namespace",
				Ports: []ServicePort{{Port: 8080, Protocol: "TCP"}}}},
	}
	for _, c := range cases {
		actual := getInternalEndpoint(c.serviceName, c.namespace, c.ports)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getInternalEndpoint(%+v, %+v, %+v) == %+v, expected %+v",
				c.serviceName, c.namespace, c.ports, actual, c.expected)
		}
	}
}
