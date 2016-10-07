// Copyright 2015 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http:Service//www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package pod

import (
	"reflect"
	"testing"

	"k8s.io/kubernetes/pkg/api"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
)

// TestToPodContainerStates tests that ToPod returns the correct container states
func TestToPodContainerStates(t *testing.T) {
	pod := &api.Pod{
		Status: api.PodStatus{
			Phase: api.PodRunning,
			ContainerStatuses: []api.ContainerStatus{
				api.ContainerStatus{
					State: api.ContainerState{
						Terminated: &api.ContainerStateTerminated{
							Reason: "Terminated Test Reason",
						},
					},
				},
				api.ContainerStatus{
					State: api.ContainerState{
						Waiting: &api.ContainerStateWaiting{
							Reason: "Waiting Test Reason",
						},
					},
				},
			},
		},
	}

	expected := Pod{
		TypeMeta: common.TypeMeta{Kind: common.ResourceKindPod},
		PodStatus: PodStatus{
			PodPhase: api.PodRunning,
			ContainerStates: []api.ContainerState{
				api.ContainerState{
					Terminated: &api.ContainerStateTerminated{
						Reason: "Terminated Test Reason",
					},
				},
				api.ContainerState{
					Waiting: &api.ContainerStateWaiting{
						Reason: "Waiting Test Reason",
					},
				},
			},
		},
	}

	actual := ToPod(pod, &common.MetricsByPod{})

	if !reflect.DeepEqual(actual, expected) {
		t.Errorf("ToPod(%#v) == \ngot %#v, \nexpected %#v", pod, actual, expected)
	}
}

func TestGetPodDetail(t *testing.T) {
	cases := []struct {
		pod      *api.Pod
		metrics  *common.MetricsByPod
		expected Pod
	}{
		{
			pod: &api.Pod{}, metrics: &common.MetricsByPod{}, expected: Pod{
				TypeMeta: common.TypeMeta{Kind: common.ResourceKindPod},
			},
		}, {
			pod: &api.Pod{
				ObjectMeta: api.ObjectMeta{
					Name: "test-pod", Namespace: "test-namespace",
				}},
			metrics: &common.MetricsByPod{},
			expected: Pod{
				TypeMeta: common.TypeMeta{Kind: common.ResourceKindPod},
				ObjectMeta: common.ObjectMeta{
					Name:      "test-pod",
					Namespace: "test-namespace",
				},
			},
		},
	}

	for _, c := range cases {
		actual := ToPod(c.pod, c.metrics)

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("ToPod(%#v) == \ngot %#v, \nexpected %#v", c.pod, actual,
				c.expected)
		}
	}
}
