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

	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/api/unversioned"
	"k8s.io/kubernetes/pkg/apis/extensions"
	"k8s.io/kubernetes/pkg/client/unversioned/testclient"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
)

func TestGetReplicaSetEvents(t *testing.T) {
	cases := []struct {
		namespace, name string
		eventList       *api.EventList
		podList         *api.PodList
		replicaSet      *extensions.ReplicaSet
		expectedActions []string
		expected        *common.EventList
	}{
		{
			"test-namespace", "test-name",
			&api.EventList{Items: []api.Event{
				{Message: "test-message", ObjectMeta: api.ObjectMeta{Namespace: "test-namespace"}},
			}},
			&api.PodList{Items: []api.Pod{{ObjectMeta: api.ObjectMeta{Name: "test-pod"}}}},
			&extensions.ReplicaSet{
				ObjectMeta: api.ObjectMeta{Name: "test-replicaset"},
				Spec: extensions.ReplicaSetSpec{
					Selector: &unversioned.LabelSelector{
						MatchLabels: map[string]string{},
					}}},
			[]string{"list", "get", "list", "list"},
			&common.EventList{
				ListMeta: common.ListMeta{TotalItems: 1},
				Events: []common.Event{{
					TypeMeta:   common.TypeMeta{Kind: common.ResourceKindEvent},
					ObjectMeta: common.ObjectMeta{Namespace: "test-namespace"},
					Message:    "test-message",
					Type:       api.EventTypeNormal,
				}}},
		},
	}

	for _, c := range cases {
		fakeClient := testclient.NewSimpleFake(c.eventList, c.replicaSet, c.podList,
			&api.EventList{})

		actual, _ := GetReplicaSetEvents(fakeClient, dataselect.NoDataSelect, c.namespace, c.name)

		actions := fakeClient.Actions()
		if len(actions) != len(c.expectedActions) {
			t.Errorf("Unexpected actions: %v, expected %d actions got %d", actions,
				len(c.expectedActions), len(actions))
			continue
		}

		for i, verb := range c.expectedActions {
			if actions[i].GetVerb() != verb {
				t.Errorf("Unexpected action: %+v, expected %s",
					actions[i], verb)
			}
		}

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetEvents(client,heapsterClient,%#v, %#v) == \ngot: %#v, \nexpected %#v",
				c.namespace, c.name, actual, c.expected)
		}
	}
}

func TestGetReplicaSetPodsEvents(t *testing.T) {
	cases := []struct {
		namespace, name string
		eventList       *api.EventList
		podList         *api.PodList
		replicaSet      *extensions.ReplicaSet
		expectedActions []string
		expected        []api.Event
	}{
		{
			"test-namespace", "test-name",
			&api.EventList{Items: []api.Event{
				{Message: "test-message", ObjectMeta: api.ObjectMeta{Namespace: "test-namespace"}},
			}},
			&api.PodList{Items: []api.Pod{{ObjectMeta: api.ObjectMeta{Name: "test-pod", Namespace: "test-namespace"}}}},
			&extensions.ReplicaSet{
				ObjectMeta: api.ObjectMeta{Name: "test-replicaset", Namespace: "test-namespace"},
				Spec: extensions.ReplicaSetSpec{
					Selector: &unversioned.LabelSelector{
						MatchLabels: map[string]string{},
					}}},
			[]string{"get", "list", "list"},
			[]api.Event{{Message: "test-message", ObjectMeta: api.ObjectMeta{Namespace: "test-namespace"}}},
		},
	}

	for _, c := range cases {
		fakeClient := testclient.NewSimpleFake(c.replicaSet, c.podList, c.eventList)

		actual, _ := GetReplicaSetPodsEvents(fakeClient, c.namespace, c.name)

		actions := fakeClient.Actions()
		if len(actions) != len(c.expectedActions) {
			t.Errorf("Unexpected actions: %v, expected %d actions got %d", actions,
				len(c.expectedActions), len(actions))
			continue
		}

		for i, verb := range c.expectedActions {
			if actions[i].GetVerb() != verb {
				t.Errorf("Unexpected action: %+v, expected %s",
					actions[i], verb)
			}
		}

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetEvents(client,heapsterClient,%#v, %#v) == \ngot: %#v, \nexpected %#v",
				c.namespace, c.name, actual, c.expected)
		}
	}
}
