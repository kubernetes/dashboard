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

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	api "k8s.io/client-go/pkg/api/v1"
)

// TestToPodPodStatusFailed tests the returned status for pods that have completed unsuccessfully.
func TestToPodPodStatusFailed(t *testing.T) {
	pod := &api.Pod{
		Status: api.PodStatus{
			Phase: api.PodFailed,
			Conditions: []api.PodCondition{
				{
					Type:   api.PodInitialized,
					Status: api.ConditionTrue,
				},
			},
		},
	}

	expected := Pod{
		TypeMeta: common.TypeMeta{Kind: common.ResourceKindPod},
		PodStatus: PodStatus{
			Status:   "failed",
			PodPhase: api.PodFailed,
		},
	}

	actual := ToPod(pod, &common.MetricsByPod{}, []common.Event{})

	if !reflect.DeepEqual(actual, expected) {
		t.Errorf("ToPod(%#v) == \ngot %#v, \nexpected %#v", pod, actual, expected)
	}
}

// TestToPodPodStatusSucceeded tests the returned status for pods that have completed successfully.
func TestToPodPodStatusSucceeded(t *testing.T) {
	pod := &api.Pod{
		Status: api.PodStatus{
			Phase: api.PodSucceeded,
			Conditions: []api.PodCondition{
				{
					Type:   api.PodInitialized,
					Status: api.ConditionTrue,
				},
			},
		},
	}

	expected := Pod{
		TypeMeta: common.TypeMeta{Kind: common.ResourceKindPod},
		PodStatus: PodStatus{
			Status:   "success",
			PodPhase: api.PodSucceeded,
		},
	}

	actual := ToPod(pod, &common.MetricsByPod{}, []common.Event{})

	if !reflect.DeepEqual(actual, expected) {
		t.Errorf("ToPod(%#v) == \ngot %#v, \nexpected %#v", pod, actual, expected)
	}
}

// TestToPodPodStatusRunning tests the returned status for pods that are running in a ready state.
func TestToPodPodStatusRunning(t *testing.T) {
	pod := &api.Pod{
		Status: api.PodStatus{
			Phase: api.PodRunning,
			Conditions: []api.PodCondition{
				{
					Type:   api.PodInitialized,
					Status: api.ConditionTrue,
				},
				{
					Type:   api.PodReady,
					Status: api.ConditionTrue,
				},
			},
		},
	}

	expected := Pod{
		TypeMeta: common.TypeMeta{Kind: common.ResourceKindPod},
		PodStatus: PodStatus{
			Status:   "success",
			PodPhase: api.PodRunning,
		},
	}

	actual := ToPod(pod, &common.MetricsByPod{}, []common.Event{})

	if !reflect.DeepEqual(actual, expected) {
		t.Errorf("ToPod(%#v) == \ngot %#v, \nexpected %#v", pod, actual, expected)
	}
}

// TestToPodPodStatusPending tests the returned status for pods that are in a pending phase
func TestToPodPodStatusPending(t *testing.T) {
	pod := &api.Pod{
		Status: api.PodStatus{
			Phase: api.PodPending,
			Conditions: []api.PodCondition{
				{
					Type:   api.PodInitialized,
					Status: api.ConditionFalse,
				},
			},
		},
	}

	expected := Pod{
		TypeMeta: common.TypeMeta{Kind: common.ResourceKindPod},
		PodStatus: PodStatus{
			Status:   "pending",
			PodPhase: api.PodPending,
		},
	}

	actual := ToPod(pod, &common.MetricsByPod{}, []common.Event{})

	if !reflect.DeepEqual(actual, expected) {
		t.Errorf("ToPod(%#v) == \ngot %#v, \nexpected %#v", pod, actual, expected)
	}
}

// TestToPodContainerStates tests that ToPod returns the correct container states
func TestToPodContainerStates(t *testing.T) {
	pod := &api.Pod{
		Status: api.PodStatus{
			Phase: api.PodRunning,
			ContainerStatuses: []api.ContainerStatus{
				{
					State: api.ContainerState{
						Terminated: &api.ContainerStateTerminated{
							Reason: "Terminated Test Reason",
						},
					},
				},
				{
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
			Status:   "pending",
			ContainerStates: []api.ContainerState{
				{
					Terminated: &api.ContainerStateTerminated{
						Reason: "Terminated Test Reason",
					},
				},
				{
					Waiting: &api.ContainerStateWaiting{
						Reason: "Waiting Test Reason",
					},
				},
			},
		},
	}

	actual := ToPod(pod, &common.MetricsByPod{}, []common.Event{})

	if !reflect.DeepEqual(actual, expected) {
		t.Errorf("ToPod(%#v) == \ngot %#v, \nexpected %#v", pod, actual, expected)
	}
}

// TestToPod tests the the ToPod function in basic scenarios.
func TestToPod(t *testing.T) {
	cases := []struct {
		pod      *api.Pod
		metrics  *common.MetricsByPod
		expected Pod
	}{
		{
			pod: &api.Pod{}, metrics: &common.MetricsByPod{},
			expected: Pod{
				TypeMeta: common.TypeMeta{Kind: common.ResourceKindPod},
				PodStatus: PodStatus{
					Status: "pending",
				},
			},
		}, {
			pod: &api.Pod{
				ObjectMeta: metaV1.ObjectMeta{
					Name: "test-pod", Namespace: "test-namespace",
				}},
			metrics: &common.MetricsByPod{},
			expected: Pod{
				TypeMeta: common.TypeMeta{Kind: common.ResourceKindPod},
				ObjectMeta: common.ObjectMeta{
					Name:      "test-pod",
					Namespace: "test-namespace",
				},
				PodStatus: PodStatus{
					Status: "pending",
				},
			},
		},
	}

	for _, c := range cases {
		actual := ToPod(c.pod, c.metrics, []common.Event{})

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("ToPod(%#v) == \ngot %#v, \nexpected %#v", c.pod, actual,
				c.expected)
		}
	}
}
