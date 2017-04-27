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

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/metric"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	api "k8s.io/client-go/pkg/api/v1"
	extensions "k8s.io/client-go/pkg/apis/extensions/v1beta1"
)

func TestGetDaemonSetList(t *testing.T) {
	events := []api.Event{}
	controller := true
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
	diffNamespacePodMeta := metaV1.ObjectMeta{
		Namespace: "namespace-2",
		OwnerReferences: []metaV1.OwnerReference{
			{
				Kind:       "DaemonSet",
				Name:       "my-name-1",
				UID:        "uid-1",
				Controller: &controller,
			},
		},
	}

	cases := []struct {
		daemonSets []extensions.DaemonSet
		services   []api.Service
		pods       []api.Pod
		nodes      []api.Node
		expected   *DaemonSetList
	}{
		{nil, nil, nil, nil, &DaemonSetList{
			DaemonSets:        []DaemonSet{},
			CumulativeMetrics: make([]metric.Metric, 0)},
		}, {
			[]extensions.DaemonSet{
				{
					ObjectMeta: metaV1.ObjectMeta{
						Name:      "my-app-1",
						Namespace: "namespace-1",
						UID:       "uid-1",
					},
					Spec: extensions.DaemonSetSpec{
						Selector: &metaV1.LabelSelector{
							MatchLabels: map[string]string{"app": "my-name-1"},
						},
						Template: api.PodTemplateSpec{
							Spec: api.PodSpec{Containers: []api.Container{{Image: "my-container-image-1"}}},
						},
					},
				},
				{
					ObjectMeta: metaV1.ObjectMeta{
						Name:      "my-app-2",
						Namespace: "namespace-2",
					},
					Spec: extensions.DaemonSetSpec{
						Selector: &metaV1.LabelSelector{
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
					ObjectMeta: metaV1.ObjectMeta{
						Name:      "my-app-1",
						Namespace: "namespace-1",
					},
				},
				{
					Spec: api.ServiceSpec{Selector: map[string]string{"app": "my-name-2", "ver": "2"}},
					ObjectMeta: metaV1.ObjectMeta{
						Name:      "my-app-2",
						Namespace: "namespace-2",
					},
				},
			},
			[]api.Pod{
				{
					ObjectMeta: validPodMeta,
					Status: api.PodStatus{
						Phase: api.PodFailed,
					},
				},
				{
					ObjectMeta: validPodMeta,
					Status: api.PodStatus{
						Phase: api.PodFailed,
					},
				},
				{
					ObjectMeta: validPodMeta,
					Status: api.PodStatus{
						Phase: api.PodPending,
					},
				},
				{
					ObjectMeta: diffNamespacePodMeta,
					Status: api.PodStatus{
						Phase: api.PodPending,
					},
				},
				{
					ObjectMeta: validPodMeta,
					Status: api.PodStatus{
						Phase: api.PodRunning,
					},
				},
				{
					ObjectMeta: validPodMeta,
					Status: api.PodStatus{
						Phase: api.PodSucceeded,
					},
				},
				{
					ObjectMeta: validPodMeta,
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
			&DaemonSetList{
				ListMeta:          common.ListMeta{TotalItems: 2},
				CumulativeMetrics: make([]metric.Metric, 0),
				DaemonSets: []DaemonSet{
					{
						ObjectMeta: common.ObjectMeta{
							Name:      "my-app-1",
							Namespace: "namespace-1",
						},
						TypeMeta:        common.TypeMeta{Kind: common.ResourceKindDaemonSet},
						ContainerImages: []string{"my-container-image-1"},
						Pods: common.PodInfo{
							Failed:    2,
							Pending:   1,
							Running:   1,
							Succeeded: 1,
							Warnings:  []common.Event{},
						},
					}, {
						ObjectMeta: common.ObjectMeta{
							Name:      "my-app-2",
							Namespace: "namespace-2",
						},
						TypeMeta:        common.TypeMeta{Kind: common.ResourceKindDaemonSet},
						ContainerImages: []string{"my-container-image-2"},
						Pods: common.PodInfo{
							Warnings: []common.Event{},
						},
					},
				},
			},
		},
	}
	for _, c := range cases {
		actual := CreateDaemonSetList(c.daemonSets, c.pods, events, dataselect.NoDataSelect, nil)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("CreateDaemonSetList(%#v, %#v, %#v) == \n%#v\nexpected \n%#v\n",
				c.daemonSets, c.services, events, actual, c.expected)
		}
	}
}
