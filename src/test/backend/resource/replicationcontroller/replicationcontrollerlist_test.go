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

	. "github.com/kubernetes/dashboard/resource/event"
	"k8s.io/kubernetes/pkg/api"
)

func TestIsLabelSelectorMatching(t *testing.T) {
	cases := []struct {
		serviceSelector, replicationControllerSelector map[string]string
		expected                                       bool
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
		actual := isLabelSelectorMatching(c.serviceSelector, c.replicationControllerSelector)
		if actual != c.expected {
			t.Errorf("isLabelSelectorMatching(%+v, %+v) == %+v, expected %+v",
				c.serviceSelector, c.replicationControllerSelector, actual, c.expected)
		}
	}
}

func TestGetMatchingServices(t *testing.T) {
	cases := []struct {
		services              []api.Service
		replicationController *api.ReplicationController
		expected              []api.Service
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
		actual := getMatchingServices(c.services, c.replicationController)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getMatchingServices(%+v, %+v) == %+v, expected %+v",
				c.services, c.replicationController, actual, c.expected)
		}
	}
}

func TestGetReplicationControllerList(t *testing.T) {
	events := []api.Event{}

	cases := []struct {
		replicationControllers []api.ReplicationController
		services               []api.Service
		pods                   []api.Pod
		nodes                  []api.Node
		expected               *ReplicationControllerList
	}{
		{nil, nil, nil, nil, &ReplicationControllerList{ReplicationControllers: []ReplicationController{}}},
		{
			[]api.ReplicationController{
				{
					ObjectMeta: api.ObjectMeta{
						Name:      "my-app-1",
						Namespace: "namespace-1",
					},
					Spec: api.ReplicationControllerSpec{
						Selector: map[string]string{"app": "my-name-1"},
						Template: &api.PodTemplateSpec{
							Spec: api.PodSpec{Containers: []api.Container{{Image: "my-container-image-1"}}},
						},
					},
				},
				{
					ObjectMeta: api.ObjectMeta{
						Name:      "my-app-2",
						Namespace: "namespace-2",
					},
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
			[]api.Pod{
				{
					ObjectMeta: api.ObjectMeta{
						Namespace: "namespace-1",
						Labels:    map[string]string{"app": "my-name-1"},
					},
					Status: api.PodStatus{
						Phase: api.PodFailed,
					},
				},
				{
					ObjectMeta: api.ObjectMeta{
						Namespace: "namespace-1",
						Labels:    map[string]string{"app": "my-name-1"},
					},
					Status: api.PodStatus{
						Phase: api.PodFailed,
					},
				},
				{
					ObjectMeta: api.ObjectMeta{
						Namespace: "namespace-1",
						Labels:    map[string]string{"app": "my-name-1"},
					},
					Status: api.PodStatus{
						Phase: api.PodPending,
					},
				},
				{
					ObjectMeta: api.ObjectMeta{
						Namespace: "namespace-2",
						Labels:    map[string]string{"app": "my-name-1"},
					},
					Status: api.PodStatus{
						Phase: api.PodPending,
					},
				},
				{
					ObjectMeta: api.ObjectMeta{
						Namespace: "namespace-1",
						Labels:    map[string]string{"app": "my-name-1"},
					},
					Status: api.PodStatus{
						Phase: api.PodRunning,
					},
				},
				{
					ObjectMeta: api.ObjectMeta{
						Namespace: "namespace-1",
						Labels:    map[string]string{"app": "my-name-1"},
					},
					Status: api.PodStatus{
						Phase: api.PodSucceeded,
					},
				},
				{
					ObjectMeta: api.ObjectMeta{
						Namespace: "namespace-1",
						Labels:    map[string]string{"app": "my-name-1"},
					},
					Status: api.PodStatus{
						Phase: api.PodUnknown,
					},
				},
			},
			[]api.Node{{
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
			&ReplicationControllerList{
				ReplicationControllers: []ReplicationController{
					{
						Name:              "my-app-1",
						Namespace:         "namespace-1",
						ContainerImages:   []string{"my-container-image-1"},
						InternalEndpoints: []Endpoint{{Host: "my-app-1.namespace-1"}},
						Pods: ReplicationControllerPodInfo{
							Failed:   2,
							Pending:  1,
							Running:  1,
							Warnings: []Event{},
						},
					}, {
						Name:              "my-app-2",
						Namespace:         "namespace-2",
						ContainerImages:   []string{"my-container-image-2"},
						InternalEndpoints: []Endpoint{{Host: "my-app-2.namespace-2"}},
						Pods: ReplicationControllerPodInfo{
							Warnings: []Event{},
						},
					},
				},
			},
		},
	}
	for _, c := range cases {
		actual := getReplicationControllerList(c.replicationControllers, c.services, c.pods,
			events, c.nodes)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getReplicationControllerList(%#v, %#v) == \n%#v\nexpected \n%#v\n",
				c.replicationControllers, c.services, actual, c.expected)
		}
	}
}
