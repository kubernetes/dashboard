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
	"time"

	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/api/unversioned"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"k8s.io/kubernetes/pkg/client/unversioned/testclient"
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
			"test-namespace", "test-name",
			&api.EventList{
				Items: []api.Event{
					{Message: "test-event-msg", ObjectMeta: api.ObjectMeta{Namespace: "test-namespace"}},
				},
			},
			[]string{"list"},
			[]api.Event{
				{Message: "test-event-msg", ObjectMeta: api.ObjectMeta{Namespace: "test-namespace"}},
			},
		},
	}

	for _, c := range cases {
		fakeClient := testclient.NewSimpleFake(c.eventList)

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
				ObjectMeta: api.ObjectMeta{
					Name:      "test-pod",
					Namespace: "test-namespace",
					UID:       "test-uid",
					Labels:    map[string]string{"app": "test"},
				}}, {
				ObjectMeta: api.ObjectMeta{
					Name:      "test-pod",
					Namespace: "test-namespace",
					UID:       "test-uid",
					Labels:    map[string]string{"app": "test-app"},
				}},
			}},
			&api.EventList{Items: []api.Event{{
				Message:        "event-test-msg",
				ObjectMeta:     api.ObjectMeta{Namespace: "test-namespace"},
				InvolvedObject: api.ObjectReference{UID: "test-uid"},
			}}},
			[]string{"list", "list"},
			[]api.Event{{
				Message:        "event-test-msg",
				ObjectMeta:     api.ObjectMeta{Namespace: "test-namespace"},
				InvolvedObject: api.ObjectReference{UID: "test-uid"},
			}},
		},
	}

	for _, c := range cases {
		fakeClient := testclient.NewSimpleFake(c.podList, c.eventList)

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

func TestAppendEvents(t *testing.T) {
	location, err := time.LoadLocation("Europe/Berlin")

	if err != nil {
		t.Errorf("AppendEvents(...) cannot load location")
	}

	cases := []struct {
		source   []api.Event
		target   common.EventList
		expected common.EventList
	}{
		{
			nil, common.EventList{}, common.EventList{},
		},
		{
			nil,
			common.EventList{
				Namespace: "test-namespace",
			},
			common.EventList{
				Namespace: "test-namespace",
			},
		},
		{
			[]api.Event{
				{
					Message: "my-event-msg",
					Source: api.EventSource{
						Component: "my-event-src-component",
						Host:      "my-event-src-host",
					},
					InvolvedObject: api.ObjectReference{
						FieldPath: "my-event-subobject",
					},
					Count: 7,
					FirstTimestamp: unversioned.Time{
						Time: time.Date(2015, 1, 1, 0, 0, 0, 0, location),
					},
					LastTimestamp: unversioned.Time{
						Time: time.Date(2015, 1, 1, 0, 0, 0, 0, location),
					},
					Reason: "my-event-reason",
					Type:   api.EventTypeNormal,
					ObjectMeta: api.ObjectMeta{
						Name:      "my-event",
						Namespace: "test-namespace",
					},
				},
			},
			common.EventList{
				Namespace: "test-namespace",
			},
			common.EventList{
				Namespace: "test-namespace",
				Events: []common.Event{
					{
						ObjectMeta:      common.ObjectMeta{Name: "my-event", Namespace: "test-namespace"},
						TypeMeta:        common.TypeMeta{common.ResourceKindEvent},
						Message:         "my-event-msg",
						SourceComponent: "my-event-src-component",
						SourceHost:      "my-event-src-host",
						SubObject:       "my-event-subobject",
						Count:           7,
						FirstSeen: unversioned.Time{
							Time: time.Date(2015, 1, 1, 0, 0, 0, 0,
								location),
						},
						LastSeen: unversioned.Time{
							Time: time.Date(2015, 1, 1, 0, 0, 0, 0,
								location),
						},
						Reason: "my-event-reason",
						Type:   api.EventTypeNormal,
					},
				},
			},
		},
	}
	for _, c := range cases {
		actual := appendEvents(c.source, c.target)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("AppendEvents(%#v, %#v) == \n%#v, expected \n%#v",
				c.source, c.target, actual, c.expected)
		}
	}
}
