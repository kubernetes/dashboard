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
	"k8s.io/kubernetes/pkg/api"
	"reflect"
	"testing"
)

func TestIsServiceMatchingReplicaSet(t *testing.T) {
	cases := []struct {
		serviceSelector, replicaSetSelector map[string]string
		expected                            bool
	}{
		{nil, nil, false},
		{nil, map[string]string{}, false},
		{map[string]string{}, nil, false},
		{map[string]string{}, map[string]string{}, false},
		{map[string]string{"app": "my-name"}, map[string]string{}, false},
		{map[string]string{"app": "my-name", "version": "2"},
			map[string]string{"app": "my-name", "version": "1.1"}, false},
		{map[string]string{"app": "my-name", "env": "prod"},
			map[string]string{"app": "my-name", "version": "1.1"}, false},
		{map[string]string{"app": "my-name"}, map[string]string{"app": "my-name"}, true},
		{map[string]string{"app": "my-name", "version": "1.1"},
			map[string]string{"app": "my-name", "version": "1.1"}, true},
		{map[string]string{"app": "my-name"},
			map[string]string{"app": "my-name", "version": "1.1"}, true},
	}
	for _, c := range cases {
		actual := isServiceMatchingReplicaSet(c.serviceSelector, c.replicaSetSelector)
		if actual != c.expected {
			t.Errorf("isServiceMatchingReplicaSet(%+v, %+v) == %+v, expected %+v",
				c.serviceSelector, c.replicaSetSelector, actual, c.expected)
		}
	}
}

func TestGetServicePortsName(t *testing.T) {
	cases := []struct {
		ports    []api.ServicePort
		expected string
	}{
		{nil, ""},
		{[]api.ServicePort{}, ""},
		{[]api.ServicePort{{Name: "foo", Port: 8080, Protocol: "TCP"}}, " 8080/TCP"},
		{[]api.ServicePort{{Name: "foo", Port: 8080, Protocol: "TCP"},
			{Name: "foo", Port: 9191, Protocol: "UDP"}}, " 8080/TCP,9191/UDP"},
	}
	for _, c := range cases {
		actual := getServicePortsName(c.ports)
		if actual != c.expected {
			t.Errorf("getServicePortsName(%+v) == %+v, expected %+v", c.ports, actual, c.expected)
		}
	}
}

func TestGetExternalEndpoint(t *testing.T) {
	cases := []struct {
		serviceIp string
		ports     []api.ServicePort
		expected  string
	}{
		{"127.0.0.1", nil, "127.0.0.1"},
		{"127.0.0.1", []api.ServicePort{{Name: "foo", Port: 8080, Protocol: "TCP"}},
			"127.0.0.1 8080/TCP"},
	}
	for _, c := range cases {
		actual := getExternalEndpoint(c.serviceIp, c.ports)
		if actual != c.expected {
			t.Errorf("getExternalEndpoint(%+v, %+v) == %+v, expected %+v",
				c.serviceIp, c.ports, actual, c.expected)
		}
	}
}

func TestGetInternalEndpoint(t *testing.T) {
	cases := []struct {
		serviceName, namespace string
		ports                  []api.ServicePort
		expected               string
	}{
		{"my-service", api.NamespaceDefault, nil, "my-service"},
		{"my-service", api.NamespaceDefault,
			[]api.ServicePort{{Name: "foo", Port: 8080, Protocol: "TCP"}},
			"my-service 8080/TCP"},
		{"my-service", "my-namespace", nil, "my-service.my-namespace"},
		{"my-service", "my-namespace",
			[]api.ServicePort{{Name: "foo", Port: 8080, Protocol: "TCP"}},
			"my-service.my-namespace 8080/TCP"},
	}
	for _, c := range cases {
		actual := getInternalEndpoint(c.serviceName, c.namespace, c.ports)
		if actual != c.expected {
			t.Errorf("getInternalEndpoint(%+v, %+v, %+v) == %+v, expected %+v",
				c.serviceName, c.namespace, c.ports, actual, c.expected)
		}
	}
}

func TestGetMatchingServices(t *testing.T) {
	cases := []struct {
		services   []api.Service
		replicaSet *api.ReplicationController
		expected   []api.Service
	}{
		{nil, nil, nil},
		{
			[]api.Service{{Spec: api.ServiceSpec{Selector: map[string]string{"app": "my-name"}}}},
			&api.ReplicationController{
				Spec: api.ReplicationControllerSpec{Selector: map[string]string{"app": "my-name"}}},
			[]api.Service{{Spec: api.ServiceSpec{Selector: map[string]string{"app": "my-name"}}}},
		},
		{
			[]api.Service{
				{Spec: api.ServiceSpec{Selector: map[string]string{"app": "my-name"}}},
				{Spec: api.ServiceSpec{Selector: map[string]string{"app": "my-name", "ver": "2"}}},
			},
			&api.ReplicationController{
				Spec: api.ReplicationControllerSpec{Selector: map[string]string{"app": "my-name"}}},
			[]api.Service{{Spec: api.ServiceSpec{Selector: map[string]string{"app": "my-name"}}}},
		},
	}
	for _, c := range cases {
		actual := getMatchingServices(c.services, c.replicaSet)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getMatchingServices(%+v, %+v) == %+v, expected %+v",
				c.services, c.replicaSet, actual, c.expected)
		}
	}
}

func TestGetReplicaSetList(t *testing.T) {
	cases := []struct {
		replicaSets []api.ReplicationController
		services    []api.Service
		expected    *ReplicaSetList
	}{
		{nil, nil, &ReplicaSetList{ReplicaSets: []ReplicaSet{}}},
		{
			[]api.ReplicationController{
				{
					Spec: api.ReplicationControllerSpec{
						Selector: map[string]string{"app": "my-name-1"},
						Template: &api.PodTemplateSpec{
							Spec: api.PodSpec{Containers: []api.Container{{Image: "my-container-image-1"}}},
						},
					},
				},
				{
					Spec: api.ReplicationControllerSpec{
						Selector: map[string]string{"app": "my-name-2", "ver": "2"},
						Template: &api.PodTemplateSpec{
							Spec: api.PodSpec{Containers: []api.Container{{Image: "my-container-image-2"}}},
						},
					},
				},
			},
			[]api.Service{
				{
					Spec: api.ServiceSpec{Selector: map[string]string{"app": "my-name-1"}},
					ObjectMeta: api.ObjectMeta{
						Name:      "my-app-1",
						Namespace: "namespace-1",
					},
				},
				{
					Spec: api.ServiceSpec{Selector: map[string]string{"app": "my-name-2", "ver": "2"}},
					ObjectMeta: api.ObjectMeta{
						Name:      "my-app-2",
						Namespace: "namespace-2",
					},
				},
			},
			&ReplicaSetList{
				ReplicaSets: []ReplicaSet{
					{
						ContainerImages:   []string{"my-container-image-1"},
						InternalEndpoints: []string{"my-app-1.namespace-1"},
					}, {
						ContainerImages:   []string{"my-container-image-2"},
						InternalEndpoints: []string{"my-app-2.namespace-2"},
					},
				},
			},
		},
	}
	for _, c := range cases {
		actual := getReplicaSetList(c.replicaSets, c.services)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getReplicaSetList(%#v, %#v) == %#v, expected %#v",
				c.replicaSets, c.services, actual, c.expected)
		}
	}
}
