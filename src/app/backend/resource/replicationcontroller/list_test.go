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

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/metric"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	api "k8s.io/client-go/pkg/api/v1"
)

func TestGetReplicationControllerList(t *testing.T) {
	replicas := int32(0)
	events := []api.Event{}
	controller := true
	firstAppOwnerRef := []metaV1.OwnerReference{{
		Kind:       "ReplicationController",
		Name:       "my-name-1",
		UID:        "uid-1",
		Controller: &controller,
	}}

	cases := []struct {
		replicationControllers []api.ReplicationController
		services               []api.Service
		pods                   []api.Pod
		nodes                  []api.Node
		expected               *ReplicationControllerList
	}{
		{nil, nil, nil, nil,
			&ReplicationControllerList{
				ReplicationControllers: []ReplicationController{},
				CumulativeMetrics:      make([]metric.Metric, 0),
			},
		},
		{
			[]api.ReplicationController{
				{
					ObjectMeta: metaV1.ObjectMeta{
						Name:      "my-app-1",
						Namespace: "namespace-1",
						UID:       "uid-1",
					},
					Spec: api.ReplicationControllerSpec{
						Replicas: &replicas,
						Selector: map[string]string{"app": "my-name-1"},
						Template: &api.PodTemplateSpec{
							Spec: api.PodSpec{Containers: []api.Container{{Image: "my-container-image-1"}}},
						},
					},
				},
				{
					ObjectMeta: metaV1.ObjectMeta{
						Name:      "my-app-2",
						Namespace: "namespace-2",
						UID:       "uid-2",
					},
					Spec: api.ReplicationControllerSpec{
						Replicas: &replicas,
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
					ObjectMeta: metaV1.ObjectMeta{
						Name:      "my-app-1",
						Namespace: "namespace-1",
						UID:       "uid-1",
					},
				},
				{
					Spec: api.ServiceSpec{Selector: map[string]string{"app": "my-name-2", "ver": "2"}},
					ObjectMeta: metaV1.ObjectMeta{
						Name:      "my-app-2",
						Namespace: "namespace-2",
						UID:       "uid-1",
					},
				},
			},
			[]api.Pod{
				{
					ObjectMeta: metaV1.ObjectMeta{
						Namespace:       "namespace-1",
						OwnerReferences: firstAppOwnerRef,
					},
					Status: api.PodStatus{
						Phase: api.PodFailed,
					},
				},
				{
					ObjectMeta: metaV1.ObjectMeta{
						Namespace:       "namespace-1",
						OwnerReferences: firstAppOwnerRef,
					},
					Status: api.PodStatus{
						Phase: api.PodFailed,
					},
				},
				{
					ObjectMeta: metaV1.ObjectMeta{
						Namespace:       "namespace-1",
						OwnerReferences: firstAppOwnerRef,
					},
					Status: api.PodStatus{
						Phase: api.PodPending,
					},
				},
				{
					ObjectMeta: metaV1.ObjectMeta{
						Namespace:       "namespace-2",
						OwnerReferences: firstAppOwnerRef,
					},
					Status: api.PodStatus{
						Phase: api.PodPending,
					},
				},
				{
					ObjectMeta: metaV1.ObjectMeta{
						Namespace:       "namespace-1",
						OwnerReferences: firstAppOwnerRef,
					},
					Status: api.PodStatus{
						Phase: api.PodRunning,
					},
				},
				{
					ObjectMeta: metaV1.ObjectMeta{
						Namespace:       "namespace-1",
						OwnerReferences: firstAppOwnerRef,
					},
					Status: api.PodStatus{
						Phase: api.PodSucceeded,
					},
				},
				{
					ObjectMeta: metaV1.ObjectMeta{
						Namespace:       "namespace-1",
						OwnerReferences: firstAppOwnerRef,
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
				ListMeta:          common.ListMeta{TotalItems: 2},
				CumulativeMetrics: make([]metric.Metric, 0),
				ReplicationControllers: []ReplicationController{
					{
						ObjectMeta: common.ObjectMeta{
							Name:      "my-app-1",
							Namespace: "namespace-1",
						},
						TypeMeta:        common.TypeMeta{Kind: common.ResourceKindReplicationController},
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
						TypeMeta:        common.TypeMeta{Kind: common.ResourceKindReplicationController},
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
		actual := CreateReplicationControllerList(c.replicationControllers, dataselect.NoDataSelect,
			c.pods, events, nil)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getReplicationControllerList(%#v, %#v) == \n%#v\nexpected \n%#v\n",
				c.replicationControllers, c.services, actual, c.expected)
		}
	}
}
