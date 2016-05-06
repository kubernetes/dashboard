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

package daemonset

import (
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/resource/replicationcontroller"
	"k8s.io/kubernetes/pkg/api"
)

func TestGetDaemonSetPods(t *testing.T) {

	pods := []api.Pod{
		{
			ObjectMeta: api.ObjectMeta{
				Name: "pod-1",
			},
			Spec: api.PodSpec{
				Containers: []api.Container{
					{Name: "container-1"},
					{Name: "container-2"},
				},
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
			Spec: api.PodSpec{
				Containers: []api.Container{
					{Name: "container-3"},
				},
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
	}

	cases := []struct {
		pods     []api.Pod
		limit    int
		expected *DaemonSetPods
	}{
		{nil, 0, &DaemonSetPods{Pods: []DaemonSetPodWithContainers{}}},
		{pods, 10, &DaemonSetPods{Pods: []DaemonSetPodWithContainers{
			{
				Name:              "pod-2",
				TotalRestartCount: 10,
				PodContainers: []replicationcontroller.PodContainer{
					{
						Name:         "container-3",
						RestartCount: 10,
					},
				},
			},
			{
				Name:              "pod-1",
				TotalRestartCount: 2,
				PodContainers: []replicationcontroller.PodContainer{
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
		}},
		},
		{pods, 1, &DaemonSetPods{Pods: []DaemonSetPodWithContainers{
			{
				Name:              "pod-2",
				TotalRestartCount: 10,
				PodContainers: []replicationcontroller.PodContainer{
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
		actual := getDaemonSetPods(c.pods, c.limit)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getDaemonSetPods(%#v) == %#v, expected %#v",
				c.pods, actual, c.expected)
		}
	}
}
