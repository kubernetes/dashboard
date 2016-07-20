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

package replicaset

import (
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/pod"

	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/api/unversioned"
	"k8s.io/kubernetes/pkg/apis/extensions"
)

func TestCreateReplicaSetList(t *testing.T) {
	cases := []struct {
		replicaSets []extensions.ReplicaSet
		pods        []api.Pod
		events      []api.Event
		expected    *ReplicaSetList
	}{
		{
			[]extensions.ReplicaSet{
				{
					ObjectMeta: api.ObjectMeta{Name: "replica-set", Namespace: "ns-1"},
					Spec: extensions.ReplicaSetSpec{Selector: &unversioned.LabelSelector{
						MatchLabels: map[string]string{"key": "value"},
					}},
				},
			},
			[]api.Pod{},
			[]api.Event{},
			&ReplicaSetList{
				ListMeta: common.ListMeta{TotalItems: 1},
				ReplicaSets: []ReplicaSet{
					{
						ObjectMeta: common.ObjectMeta{Name: "replica-set", Namespace: "ns-1"},
						TypeMeta:   common.TypeMeta{Kind: common.ResourceKindReplicaSet},
						Pods:       common.PodInfo{Warnings: []common.Event{}},
					},
				},
			},
		},
	}

	for _, c := range cases {
		actual := CreateReplicaSetList(c.replicaSets, c.pods, c.events, common.NO_PAGINATION)

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("CreateReplicaSetList(%#v, %#v, %#v, ...) == \ngot %#v, \nexpected %#v",
				c.replicaSets, c.pods, c.events, actual, c.expected)
		}
	}
}

func TestToReplicaSet(t *testing.T) {
	cases := []struct {
		replicaSet *extensions.ReplicaSet
		podInfo    *common.PodInfo
		expected   ReplicaSet
	}{
		{
			&extensions.ReplicaSet{ObjectMeta: api.ObjectMeta{Name: "replica-set"}},
			&common.PodInfo{Running: 1, Warnings: []common.Event{}},
			ReplicaSet{
				ObjectMeta: common.ObjectMeta{Name: "replica-set"},
				TypeMeta:   common.TypeMeta{Kind: common.ResourceKindReplicaSet},
				Pods:       common.PodInfo{Running: 1, Warnings: []common.Event{}},
			},
		},
	}

	for _, c := range cases {
		actual := ToReplicaSet(c.replicaSet, c.podInfo)

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("ToReplicaSet(%#v, %#v) == \ngot %#v, \nexpected %#v", c.replicaSet,
				c.podInfo, actual, c.expected)
		}
	}
}

func TestToReplicaSetDetail(t *testing.T) {
	cases := []struct {
		replicaSet *extensions.ReplicaSet
		eventList  common.EventList
		podList    pod.PodList
		podInfo    common.PodInfo
		expected   ReplicaSetDetail
	}{
		{
			&extensions.ReplicaSet{},
			common.EventList{},
			pod.PodList{},
			common.PodInfo{},
			ReplicaSetDetail{TypeMeta: common.TypeMeta{Kind: common.ResourceKindReplicaSet}},
		}, {
			&extensions.ReplicaSet{ObjectMeta: api.ObjectMeta{Name: "replica-set"}},
			common.EventList{Events: []common.Event{{Message: "event-msg"}}},
			pod.PodList{Pods: []pod.Pod{{ObjectMeta: common.ObjectMeta{Name: "pod-1"}}}},
			common.PodInfo{},
			ReplicaSetDetail{
				ObjectMeta: common.ObjectMeta{Name: "replica-set"},
				TypeMeta:   common.TypeMeta{Kind: common.ResourceKindReplicaSet},
				EventList:  common.EventList{Events: []common.Event{{Message: "event-msg"}}},
				PodList: pod.PodList{
					Pods: []pod.Pod{{
						ObjectMeta: common.ObjectMeta{Name: "pod-1"},
					}},
				},
			},
		},
	}

	for _, c := range cases {
		actual := ToReplicaSetDetail(c.replicaSet, c.eventList, c.podList, c.podInfo)

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("ToReplicaSetDetail(%#v, %#v, %#v, %#v) == \ngot %#v, \nexpected %#v",
				c.replicaSet, c.eventList, c.podList, c.podInfo, actual, c.expected)
		}
	}
}
