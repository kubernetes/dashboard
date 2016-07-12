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

package job

import (
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/api/unversioned"
	"k8s.io/kubernetes/pkg/apis/batch"
	"k8s.io/kubernetes/pkg/client/unversioned/testclient"
)

func TestGetJobEvents(t *testing.T) {
	cases := []struct {
		namespace, name string
		eventList       *api.EventList
		podList         *api.PodList
		job             *batch.Job
		expectedActions []string
		expected        *common.EventList
	}{
		{
			"test-namespace", "test-name",
			&api.EventList{Items: []api.Event{
				{Message: "test-message", ObjectMeta: api.ObjectMeta{Namespace: "test-namespace"}},
			}},
			&api.PodList{Items: []api.Pod{{ObjectMeta: api.ObjectMeta{Name: "test-pod"}}}},
			&batch.Job{
				ObjectMeta: api.ObjectMeta{Name: "test-job"},
				Spec: batch.JobSpec{
					Selector: &unversioned.LabelSelector{
						MatchLabels: map[string]string{},
					}}},
			[]string{"list", "get", "list", "list"},
			&common.EventList{
				ListMeta: common.ListMeta{TotalItems: 1},
				Namespace: "test-namespace",
				Events: []common.Event{{
					TypeMeta:   common.TypeMeta{Kind: common.ResourceKindEvent},
					ObjectMeta: common.ObjectMeta{Namespace: "test-namespace"},
					Message:    "test-message",
					Type:       api.EventTypeNormal,
				}}},
		},
	}

	for _, c := range cases {
		fakeClient := testclient.NewSimpleFake(c.eventList, c.job, c.podList,
			&api.EventList{})

		actual, _ := GetJobEvents(fakeClient, c.namespace, c.name)

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
			t.Errorf("TestGetJobEvents(client,heapsterClient,%#v, %#v) == \ngot: %#v, \nexpected %#v",
				c.namespace, c.name, actual, c.expected)
		}
	}
}

func TestGetJobPodsEvents(t *testing.T) {
	cases := []struct {
		namespace, name string
		eventList       *api.EventList
		podList         *api.PodList
		job             *batch.Job
		expectedActions []string
		expected        []api.Event
	}{
		{
			"test-namespace", "test-name",
			&api.EventList{Items: []api.Event{
				{Message: "test-message", ObjectMeta: api.ObjectMeta{Namespace: "test-namespace"}},
			}},
			&api.PodList{Items: []api.Pod{{ObjectMeta: api.ObjectMeta{Name: "test-pod", Namespace: "test-namespace"}}}},
			&batch.Job{
				ObjectMeta: api.ObjectMeta{Name: "test-job", Namespace: "test-namespace"},
				Spec: batch.JobSpec{
					Selector: &unversioned.LabelSelector{
						MatchLabels: map[string]string{},
					}}},
			[]string{"get", "list", "list"},
			[]api.Event{{Message: "test-message", ObjectMeta: api.ObjectMeta{Namespace: "test-namespace"}}},
		},
	}

	for _, c := range cases {
		fakeClient := testclient.NewSimpleFake(c.job, c.podList, c.eventList)

		actual, _ := GetJobPodsEvents(fakeClient, c.namespace, c.name)

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
			t.Errorf("TestGetJobPodsEvents(client,heapsterClient,%#v, %#v) == \ngot: %#v, \nexpected %#v",
				c.namespace, c.name, actual, c.expected)
		}
	}
}
