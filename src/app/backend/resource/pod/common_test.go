// Copyright 2017 The Kubernetes Authors.
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

package pod

import (
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	v1 "k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// TestToPodPodStatusFailed tests the returned status for pods that have completed unsuccessfully.
func TestToPodPodStatusFailed(t *testing.T) {
	pod := &v1.Pod{
		Status: v1.PodStatus{
			Phase: v1.PodFailed,
			Conditions: []v1.PodCondition{
				{
					Type:   v1.PodInitialized,
					Status: v1.ConditionTrue,
				},
			},
		},
	}

	expected := Pod{
		TypeMeta: api.TypeMeta{Kind: api.ResourceKindPod},
		Status:   string(v1.PodFailed),
		Warnings: []common.Event{},
	}

	actual := toPod(pod, &MetricsByPod{}, []common.Event{})

	if !reflect.DeepEqual(actual, expected) {
		t.Errorf("ToPod(%#v) == \ngot %#v, \nexpected %#v", pod, actual, expected)
	}
}

// TestToPodPodStatusSucceeded tests the returned status for pods that have completed successfully.
func TestToPodPodStatusSucceeded(t *testing.T) {
	pod := &v1.Pod{
		Status: v1.PodStatus{
			Phase: v1.PodSucceeded,
			Conditions: []v1.PodCondition{
				{
					Type:   v1.PodInitialized,
					Status: v1.ConditionTrue,
				},
			},
		},
	}

	expected := Pod{
		TypeMeta: api.TypeMeta{Kind: api.ResourceKindPod},
		Status:   string(v1.PodSucceeded),
		Warnings: []common.Event{},
	}

	actual := toPod(pod, &MetricsByPod{}, []common.Event{})

	if !reflect.DeepEqual(actual, expected) {
		t.Errorf("ToPod(%#v) == \ngot %#v, \nexpected %#v", pod, actual, expected)
	}
}

// TestToPodPodStatusRunning tests the returned status for pods that are running in a ready state.
func TestToPodPodStatusRunning(t *testing.T) {
	pod := &v1.Pod{
		Status: v1.PodStatus{
			Phase: v1.PodRunning,
			Conditions: []v1.PodCondition{
				{
					Type:   v1.PodInitialized,
					Status: v1.ConditionTrue,
				},
				{
					Type:   v1.PodReady,
					Status: v1.ConditionTrue,
				},
			},
		},
	}

	expected := Pod{
		TypeMeta: api.TypeMeta{Kind: api.ResourceKindPod},
		Status:   string(v1.PodRunning),
		Warnings: []common.Event{},
	}

	actual := toPod(pod, &MetricsByPod{}, []common.Event{})

	if !reflect.DeepEqual(actual, expected) {
		t.Errorf("ToPod(%#v) == \ngot %#v, \nexpected %#v", pod, actual, expected)
	}
}

// TestToPodPodStatusPending tests the returned status for pods that are in a pending phase
func TestToPodPodStatusPending(t *testing.T) {
	pod := &v1.Pod{
		Status: v1.PodStatus{
			Phase: v1.PodPending,
			Conditions: []v1.PodCondition{
				{
					Type:   v1.PodInitialized,
					Status: v1.ConditionFalse,
				},
			},
		},
	}

	expected := Pod{
		TypeMeta: api.TypeMeta{Kind: api.ResourceKindPod},
		Status:   string(v1.PodPending),
		Warnings: []common.Event{},
	}

	actual := toPod(pod, &MetricsByPod{}, []common.Event{})

	if !reflect.DeepEqual(actual, expected) {
		t.Errorf("ToPod(%#v) == \ngot %#v, \nexpected %#v", pod, actual, expected)
	}
}

// TestToPodContainerStates tests that ToPod returns the correct container states
func TestToPodContainerStates(t *testing.T) {
	pod := &v1.Pod{
		Status: v1.PodStatus{
			Phase: v1.PodRunning,
			ContainerStatuses: []v1.ContainerStatus{
				{
					State: v1.ContainerState{
						Terminated: &v1.ContainerStateTerminated{
							Reason: "Terminated",
						},
					},
				},
				{
					State: v1.ContainerState{
						Waiting: &v1.ContainerStateWaiting{
							Reason: "Waiting",
						},
					},
				},
			},
		},
	}

	expected := Pod{
		TypeMeta: api.TypeMeta{Kind: api.ResourceKindPod},
		Status:   "Terminated",
		Warnings: []common.Event{},
	}

	actual := toPod(pod, &MetricsByPod{}, []common.Event{})

	if !reflect.DeepEqual(actual, expected) {
		t.Errorf("ToPod(%#v) == \ngot %#v, \nexpected %#v", pod, actual, expected)
	}
}

// TestToPod tests the ToPod function in basic scenarios.
func TestToPod(t *testing.T) {
	cases := []struct {
		pod      *v1.Pod
		metrics  *MetricsByPod
		expected Pod
	}{
		{
			pod: &v1.Pod{}, metrics: &MetricsByPod{},
			expected: Pod{
				TypeMeta: api.TypeMeta{Kind: api.ResourceKindPod},
				Status:   string(v1.PodUnknown),
				Warnings: []common.Event{},
			},
		}, {
			pod: &v1.Pod{
				ObjectMeta: metaV1.ObjectMeta{
					Name: "test-pod", Namespace: "test-namespace",
				}},
			metrics: &MetricsByPod{},
			expected: Pod{
				TypeMeta: api.TypeMeta{Kind: api.ResourceKindPod},
				ObjectMeta: api.ObjectMeta{
					Name:      "test-pod",
					Namespace: "test-namespace",
				},
				Status:   string(v1.PodUnknown),
				Warnings: []common.Event{},
			},
		},
	}

	for _, c := range cases {
		actual := toPod(c.pod, c.metrics, []common.Event{})

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("ToPod(%#v) == \ngot %#v, \nexpected %#v", c.pod, actual, c.expected)
		}
	}
}
