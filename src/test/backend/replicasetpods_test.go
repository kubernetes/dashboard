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

func TestGetReplicaSetPods(t *testing.T) {

	cases := []struct {
		pods     []api.Pod
		expected *ReplicaSetPods
	}{
		{nil, &ReplicaSetPods{}},
		{[]api.Pod{
			{
				ObjectMeta: api.ObjectMeta{
					Name: "pod-1",
				},
				Status: api.PodStatus{
					ContainerStatuses: []api.ContainerStatus{
						{
							Name:         "container-1",
							RestartCount: 0,
						},
						{
							Name:         "container-2",
							RestartCount: 2,
						},
					},
				},
			},
			{
				ObjectMeta: api.ObjectMeta{
					Name: "pod-2",
				},
				Status: api.PodStatus{
					ContainerStatuses: []api.ContainerStatus{
						{
							Name:         "container-3",
							RestartCount: 10,
						},
					},
				},
			},
		}, &ReplicaSetPods{Pods: []ReplicaSetPodWithContainers{
			{
				Name: "pod-1",
				PodContainers: []PodContainer{
					{
						Name:         "container-1",
						RestartCount: 0,
					},
					{
						Name:         "container-2",
						RestartCount: 2,
					},
				},
			},
			{
				Name: "pod-2",
				PodContainers: []PodContainer{
					{
						Name:         "container-3",
						RestartCount: 10,
					},
				},
			},
		}},
		},
	}
	for _, c := range cases {
		actual := getReplicaSetPods(c.pods)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getReplicaSetPods(%#v) == %#v, expected %#v",
				c.pods, actual, c.expected)
		}
	}
}
