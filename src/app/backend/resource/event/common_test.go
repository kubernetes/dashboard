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

package event

import (
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes/fake"
	api "k8s.io/client-go/pkg/api/v1"
)

func TestGetEvents(t *testing.T) {
	cases := []struct {
		namespace       string
		name            string
		eventList       *api.EventList
		expectedActions []string
		expected        []api.Event
	}{
		{
			"ns-1", "ev-1",
			&api.EventList{Items: []api.Event{
				{Message: "test-message", ObjectMeta: metaV1.ObjectMeta{
					Name: "ev-1", Namespace: "ns-1", Labels: map[string]string{"app": "test"},
				}},
			}},
			[]string{"list"},
			[]api.Event{
				{Message: "test-message", ObjectMeta: metaV1.ObjectMeta{
					Name: "ev-1", Namespace: "ns-1", Labels: map[string]string{"app": "test"},
				}},
			},
		},
	}

	for _, c := range cases {
		fakeClient := fake.NewSimpleClientset(c.eventList)

		actual, _ := GetEvents(fakeClient, c.namespace, c.name)

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
			t.Errorf("GetEvents(client,%#v,%#v) == %#v, expected %#v", c.namespace, c.name,
				actual, c.expected)
		}
	}
}

func TestGetPodsEvents(t *testing.T) {
	cases := []struct {
		namespace       string
		selector        map[string]string
		podList         *api.PodList
		eventList       *api.EventList
		expectedActions []string
		expected        []api.Event
	}{
		{
			"test-namespace", map[string]string{"app": "test"},
			&api.PodList{Items: []api.Pod{{
				ObjectMeta: metaV1.ObjectMeta{
					Name:      "test-pod",
					Namespace: "test-namespace",
					UID:       "test-uid",
					Labels:    map[string]string{"app": "test"},
				}}, {
				ObjectMeta: metaV1.ObjectMeta{
					Name:      "test-pod-2",
					Namespace: "test-namespace",
					UID:       "test-uid",
					Labels:    map[string]string{"app": "test-app"},
				}},
			}},
			&api.EventList{Items: []api.Event{{
				Message:        "event-test-msg",
				ObjectMeta:     metaV1.ObjectMeta{Name: "ev-1", Namespace: "test-namespace"},
				InvolvedObject: api.ObjectReference{UID: "test-uid"},
			}}},
			[]string{"list", "list"},
			[]api.Event{{
				Message:        "event-test-msg",
				ObjectMeta:     metaV1.ObjectMeta{Name: "ev-1", Namespace: "test-namespace"},
				InvolvedObject: api.ObjectReference{UID: "test-uid"},
			}},
		},
	}

	for _, c := range cases {
		fakeClient := fake.NewSimpleClientset(c.podList, c.eventList)

		actual, _ := GetPodsEvents(fakeClient, c.namespace, c.selector)

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
			t.Errorf("GetPodsEvents(client,%#v,%#v) == %#v, expected %#v", c.namespace, c.selector,
				actual, c.expected)
		}
	}
}

func TestToEventList(t *testing.T) {
	cases := []struct {
		events    []api.Event
		namespace string
		expected  common.EventList
	}{
		{
			[]api.Event{
				{ObjectMeta: metaV1.ObjectMeta{Name: "event-1"}},
				{ObjectMeta: metaV1.ObjectMeta{Name: "event-2"}},
			},
			"namespace-1",
			common.EventList{
				ListMeta: common.ListMeta{TotalItems: 2},
				Events: []common.Event{
					{
						ObjectMeta: common.ObjectMeta{Name: "event-1"},
						TypeMeta:   common.TypeMeta{common.ResourceKindEvent},
					},
					{
						ObjectMeta: common.ObjectMeta{Name: "event-2"},
						TypeMeta:   common.TypeMeta{common.ResourceKindEvent},
					},
				},
			},
		},
	}

	for _, c := range cases {
		actual := CreateEventList(c.events, dataselect.NoDataSelect)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("ToEventList(%+v, %+v) == \n%+v, expected \n%+v",
				c.events, c.namespace, actual, c.expected)
		}
	}
}
