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

package daemonset

import (
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	apps "k8s.io/api/apps/v1beta2"
	"k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func TestToDaemonSetList(t *testing.T) {
	events := []v1.Event{}
	controller := true
	var desired int32 = 1
	validPodMeta := metaV1.ObjectMeta{
		Namespace: "namespace-1",
		OwnerReferences: []metaV1.OwnerReference{
			{
				Kind:       "DaemonSet",
				Name:       "my-name-1",
				UID:        "uid-1",
				Controller: &controller,
			},
		},
	}
	diffPodMeta := metaV1.ObjectMeta{
		Namespace: "namespace-2",
		OwnerReferences: []metaV1.OwnerReference{
			{
				Kind:       "DaemonSet",
				Name:       "my-name-2",
				UID:        "uid-2",
				Controller: &controller,
			},
		},
	}

	cases := []struct {
		daemonSets []apps.DaemonSet
		services   []v1.Service
		pods       []v1.Pod
		nodes      []v1.Node
		expected   *DaemonSetList
	}{
		{nil,
			nil,
			nil,
			nil,
			&DaemonSetList{
				DaemonSets:        []DaemonSet{},
				CumulativeMetrics: make([]metricapi.Metric, 0)},
		}, {
			[]apps.DaemonSet{
				{
					ObjectMeta: metaV1.ObjectMeta{
						Name:      "my-app-1",
						Namespace: "namespace-1",
						UID:       "uid-1",
					},
					Spec: apps.DaemonSetSpec{
						Selector: &metaV1.LabelSelector{
							MatchLabels: map[string]string{"app": "my-name-1"},
						},
						Template: v1.PodTemplateSpec{
							Spec: v1.PodSpec{Containers: []v1.Container{{Image: "my-container-image-1"}},
								InitContainers: []v1.Container{{Image: "my-init-container-image-1"}}},
						},
					},
					Status: apps.DaemonSetStatus{
						DesiredNumberScheduled: desired,
					},
				},
				{
					ObjectMeta: metaV1.ObjectMeta{
						Name:      "my-app-2",
						Namespace: "namespace-2",
					},
					Spec: apps.DaemonSetSpec{
						Selector: &metaV1.LabelSelector{
							MatchLabels: map[string]string{"app": "my-name-2", "ver": "2"},
						},
						Template: v1.PodTemplateSpec{
							Spec: v1.PodSpec{Containers: []v1.Container{{Image: "my-container-image-2"}},
								InitContainers: []v1.Container{{Image: "my-init-container-image-2"}}},
						},
					},
					Status: apps.DaemonSetStatus{
						DesiredNumberScheduled: desired,
					},
				},
			},
			[]v1.Service{
				{
					Spec: v1.ServiceSpec{Selector: map[string]string{"app": "my-name-1"}},
					ObjectMeta: metaV1.ObjectMeta{
						Name:      "my-app-1",
						Namespace: "namespace-1",
					},
				},
				{
					Spec: v1.ServiceSpec{Selector: map[string]string{"app": "my-name-2", "ver": "2"}},
					ObjectMeta: metaV1.ObjectMeta{
						Name:      "my-app-2",
						Namespace: "namespace-2",
					},
				},
			},
			[]v1.Pod{
				{
					ObjectMeta: validPodMeta,
					Status: v1.PodStatus{
						Phase: v1.PodFailed,
					},
				},
				{
					ObjectMeta: validPodMeta,
					Status: v1.PodStatus{
						Phase: v1.PodFailed,
					},
				},
				{
					ObjectMeta: validPodMeta,
					Status: v1.PodStatus{
						Phase: v1.PodPending,
					},
				},
				{
					ObjectMeta: diffPodMeta,
					Status: v1.PodStatus{
						Phase: v1.PodPending,
					},
				},
				{
					ObjectMeta: validPodMeta,
					Status: v1.PodStatus{
						Phase: v1.PodRunning,
					},
				},
				{
					ObjectMeta: validPodMeta,
					Status: v1.PodStatus{
						Phase: v1.PodSucceeded,
					},
				},
				{
					ObjectMeta: validPodMeta,
					Status: v1.PodStatus{
						Phase: v1.PodUnknown,
					},
				},
			},
			[]v1.Node{{
				Status: v1.NodeStatus{
					Addresses: []v1.NodeAddress{
						{
							Type:    v1.NodeExternalIP,
							Address: "192.168.1.108",
						},
					},
				},
			},
			},
			&DaemonSetList{
				ListMeta:          api.ListMeta{TotalItems: 2},
				CumulativeMetrics: make([]metricapi.Metric, 0),
				DaemonSets: []DaemonSet{
					{
						ObjectMeta: api.ObjectMeta{
							Name:      "my-app-1",
							Namespace: "namespace-1",
						},
						TypeMeta:            api.TypeMeta{Kind: api.ResourceKindDaemonSet},
						ContainerImages:     []string{"my-container-image-1"},
						InitContainerImages: []string{"my-init-container-image-1"},
						Pods: common.PodInfo{
							Desired:   &desired,
							Failed:    2,
							Pending:   1,
							Running:   1,
							Succeeded: 1,
							Warnings:  []common.Event{},
						},
					}, {
						ObjectMeta: api.ObjectMeta{
							Name:      "my-app-2",
							Namespace: "namespace-2",
						},
						TypeMeta:            api.TypeMeta{Kind: api.ResourceKindDaemonSet},
						ContainerImages:     []string{"my-container-image-2"},
						InitContainerImages: []string{"my-init-container-image-2"},
						Pods: common.PodInfo{
							Desired:  &desired,
							Warnings: []common.Event{},
						},
					},
				},
			},
		},
	}
	for _, c := range cases {
		actual := toDaemonSetList(c.daemonSets, c.pods, events, nil, dataselect.NoDataSelect, nil)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("toDaemonSetList(%#v, %#v, %#v) == \n%#v\nexpected \n%#v\n",
				c.daemonSets, c.services, events, actual, c.expected)
		}
	}
}
