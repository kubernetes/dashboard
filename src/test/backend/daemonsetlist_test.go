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
	"k8s.io/kubernetes/pkg/api/unversioned"
	"k8s.io/kubernetes/pkg/apis/extensions"
)

func TestIsLabelSelectorMatchingforDS(t *testing.T) {
	cases := []struct {
		serviceSelector   map[string]string
		daemonSetselector *unversioned.LabelSelector
		expected          bool
	}{
		{nil, nil, false},
		{nil, &unversioned.LabelSelector{MatchLabels: map[string]string{}}, false},
		{map[string]string{}, nil, false},
		{map[string]string{}, &unversioned.LabelSelector{MatchLabels: map[string]string{}},
			false},
		{map[string]string{"app": "my-name"},
			&unversioned.LabelSelector{MatchLabels: map[string]string{}},
			false},
		{map[string]string{"app": "my-name", "version": "2"},
			&unversioned.LabelSelector{MatchLabels: map[string]string{"app": "my-name", "version": "1.1"}},
			false},
		{map[string]string{"app": "my-name", "env": "prod"},
			&unversioned.LabelSelector{MatchLabels: map[string]string{"app": "my-name", "version": "1.1"}},
			false},
		{map[string]string{"app": "my-name"},
			&unversioned.LabelSelector{MatchLabels: map[string]string{"app": "my-name"}},
			true},
		{map[string]string{"app": "my-name", "version": "1.1"},
			&unversioned.LabelSelector{MatchLabels: map[string]string{"app": "my-name", "version": "1.1"}},
			true},
		{map[string]string{"app": "my-name"},
			&unversioned.LabelSelector{MatchLabels: map[string]string{"app": "my-name", "version": "1.1"}},
			true},
	}
	for _, c := range cases {
		actual := isLabelSelectorMatchingforDS(c.serviceSelector, c.daemonSetselector)
		if actual != c.expected {
			t.Errorf("isLabelSelectorMatching(%+v, %+v) == %+v, expected %+v",
				c.serviceSelector, c.daemonSetselector, actual, c.expected)
		}
	}
}

func TestGetMatchingServicesforDS(t *testing.T) {
	cases := []struct {
		services  []api.Service
		DaemonSet *extensions.DaemonSet
		expected  []api.Service
	}{
		{nil, nil, nil},
		{
			[]api.Service{{Spec: api.ServiceSpec{Selector: map[string]string{"app": "my-name"}}}},
			&extensions.DaemonSet{
				Spec: extensions.DaemonSetSpec{
					Selector: &unversioned.LabelSelector{
						MatchLabels: map[string]string{"app": "my-name"},
					},
				},
			},
			[]api.Service{{Spec: api.ServiceSpec{Selector: map[string]string{"app": "my-name"}}}},
		},
		{
			[]api.Service{
				{Spec: api.ServiceSpec{Selector: map[string]string{"app": "my-name"}}},
				{Spec: api.ServiceSpec{Selector: map[string]string{"app": "my-name", "ver": "2"}}},
			},
			&extensions.DaemonSet{
				Spec: extensions.DaemonSetSpec{
					Selector: &unversioned.LabelSelector{
						MatchLabels: map[string]string{"app": "my-name"},
					},
				},
			},
			[]api.Service{{Spec: api.ServiceSpec{Selector: map[string]string{"app": "my-name"}}}},
		},
	}
	for _, c := range cases {
		actual := getMatchingServicesforDS(c.services, c.DaemonSet)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getMatchingServices(%+v, %+v) == %+v, expected %+v",
				c.services, c.DaemonSet, actual, c.expected)
		}
	}
}

func TestGetDaemonSetList(t *testing.T) {
	getPodsErrorFnMock := func(pods []api.Pod) ([]Event, error) {
		return []Event{}, nil
	}

	cases := []struct {
		daemonSets []extensions.DaemonSet
		services   []api.Service
		pods       []api.Pod
		getNodeFn  GetNodeFunc
		expected   *DaemonSetList
	}{
		{nil, nil, nil, nil, &DaemonSetList{DaemonSets: []DaemonSet{}}},
		{
			[]extensions.DaemonSet{
				{
					ObjectMeta: api.ObjectMeta{
						Name:      "my-app-1",
						Namespace: "namespace-1",
					},
					Spec: extensions.DaemonSetSpec{
						Selector: &unversioned.LabelSelector{
							MatchLabels: map[string]string{"app": "my-name-1"},
						},
						Template: api.PodTemplateSpec{
							Spec: api.PodSpec{Containers: []api.Container{{Image: "my-container-image-1"}}},
						},
					},
				},
				{
					ObjectMeta: api.ObjectMeta{
						Name:      "my-app-2",
						Namespace: "namespace-2",
					},
					Spec: extensions.DaemonSetSpec{
						Selector: &unversioned.LabelSelector{
							MatchLabels: map[string]string{"app": "my-name-2", "ver": "2"},
						},
						Template: api.PodTemplateSpec{
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
			func(nodeName string) (*api.Node, error) {
				return &api.Node{
						Status: api.NodeStatus{
							Addresses: []api.NodeAddress{
								{
									Type:    api.NodeExternalIP,
									Address: "192.168.1.108",
								},
							},
						},
					},
					nil
			},
			&DaemonSetList{
				DaemonSets: []DaemonSet{
					{
						Name:              "my-app-1",
						Namespace:         "namespace-1",
						ContainerImages:   []string{"my-container-image-1"},
						InternalEndpoints: []Endpoint{{Host: "my-app-1.namespace-1"}},
						Pods: DaemonSetPodInfo{
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
						Pods: DaemonSetPodInfo{
							Warnings: []Event{},
						},
					},
				},
			},
		},
	}
	for _, c := range cases {
		actual, _ := getDaemonSetList(c.daemonSets, c.services, c.pods,
			getPodsErrorFnMock, c.getNodeFn)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getDaemonSetList(%#v, %#v) == \n%#v\nexpected \n%#v\n",
				c.daemonSets, c.services, actual, c.expected)
		}
	}
}
