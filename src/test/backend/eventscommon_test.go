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

package main

import (
	"reflect"
	"testing"

	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/client/unversioned/testclient"
)

func TestGetPodsEventWarningsApi(t *testing.T) {
	cases := []struct {
		pods            []api.Pod
		expectedActions []string
	}{
		{nil, []string{}},
		{
			[]api.Pod{
				{
					Status: api.PodStatus{
						Phase: api.PodFailed,
					},
				},
			},
			[]string{"get"},
		},
		{
			[]api.Pod{
				{
					Status: api.PodStatus{
						Phase: api.PodRunning,
					},
				},
			},
			[]string{},
		},
	}

	for _, c := range cases {
		eventList := &api.EventList{}
		fakeClient := testclient.NewSimpleFake(eventList)

		GetPodsEventWarnings(fakeClient, c.pods)

		actions := fakeClient.Actions()
		if len(actions) != len(c.expectedActions) {
			t.Errorf("Unexpected actions: %v, expected %d actions got %d", actions,
				len(c.expectedActions), len(actions))
			continue
		}
	}
}

func TestGetPodsEventWarnings(t *testing.T) {
	cases := []struct {
		events   *api.EventList
		expected []Event
	}{
		{&api.EventList{Items: nil}, []Event{}},
		{
			&api.EventList{
				Items: []api.Event{
					{
						Message: "msg",
						Reason:  "reason",
						Type:    api.EventTypeWarning,
					},
				},
			},
			[]Event{
				{
					Message: "msg",
					Reason:  "reason",
					Type:    api.EventTypeWarning,
				},
			},
		},
		{
			&api.EventList{
				Items: []api.Event{
					{
						Message: "msg",
						Reason:  "failed",
					},
				},
			},
			[]Event{
				{
					Message: "msg",
					Reason:  "failed",
					Type:    api.EventTypeWarning,
				},
			},
		},
		{
			&api.EventList{
				Items: []api.Event{
					{
						Message: "msg",
						Reason:  "reason",
					},
				},
			},
			[]Event{},
		},
	}

	for _, c := range cases {
		actual := getPodsEventWarnings(c.events)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getPodsEventErrors(%#v) == \n%#v\nexpected \n%#v\n",
				c.events, actual, c.expected)
		}
	}
}

func TestFilterEventsByType(t *testing.T) {
	events := []api.Event{
		{Type: api.EventTypeNormal},
		{Type: api.EventTypeWarning},
	}

	cases := []struct {
		events    []api.Event
		eventType string
		expected  []api.Event
	}{
		{nil, "", nil},
		{nil, api.EventTypeWarning, nil},
		{
			events,
			"",
			events,
		},
		{
			events,
			api.EventTypeNormal,
			[]api.Event{
				{Type: api.EventTypeNormal},
			},
		},
		{
			events,
			api.EventTypeWarning,
			[]api.Event{
				{Type: api.EventTypeWarning},
			},
		},
	}

	for _, c := range cases {
		actual := filterEventsByType(c.events, c.eventType)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("FilterEventsByType(%#v, %#v) == \n%#v\nexpected \n%#v\n",
				c.events, c.eventType, actual, c.expected)
		}
	}
}

func TestRemoveDuplicates(t *testing.T) {
	cases := []struct {
		slice    []Event
		expected []Event
	}{
		{nil, []Event{}},
		{
			[]Event{
				{Reason: "test"},
				{Reason: "test2"},
				{Reason: "test"},
			},
			[]Event{
				{Reason: "test"},
				{Reason: "test2"},
			},
		},
		{
			[]Event{
				{Reason: "test"},
				{Reason: "test"},
				{Reason: "test"},
			},
			[]Event{
				{Reason: "test"},
			},
		},
		{
			[]Event{
				{Reason: "test"},
				{Reason: "test2"},
				{Reason: "test3"},
			},
			[]Event{
				{Reason: "test"},
				{Reason: "test2"},
				{Reason: "test3"},
			},
		},
	}

	for _, c := range cases {
		actual := removeDuplicates(c.slice)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("removeDuplicates(%#v) == \n%#v\nexpected \n%#v\n",
				c.slice, actual, c.expected)
		}
	}
}

func TestIsRunningOrSucceeded(t *testing.T) {
	cases := []struct {
		pod      api.Pod
		expected bool
	}{
		{
			api.Pod{
				Status: api.PodStatus{
					Phase: api.PodRunning,
				},
			},
			true,
		},
		{
			api.Pod{
				Status: api.PodStatus{
					Phase: api.PodSucceeded,
				},
			},
			true,
		},
		{
			api.Pod{
				Status: api.PodStatus{
					Phase: api.PodFailed,
				},
			},
			false,
		},
		{
			api.Pod{
				Status: api.PodStatus{
					Phase: api.PodPending,
				},
			},
			false,
		},
	}

	for _, c := range cases {
		actual := isRunningOrSucceeded(c.pod)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("isRunningOrSucceded(%#v) == \n%#v\nexpected \n%#v\n",
				c.pod, actual, c.expected)
		}
	}
}

func TestIsTypeFilled(t *testing.T) {
	cases := []struct {
		events   []api.Event
		expected bool
	}{
		{nil, false},
		{
			[]api.Event{
				{Type: api.EventTypeWarning},
			},
			true,
		},
		{
			[]api.Event{},
			false,
		},
		{
			[]api.Event{
				{Type: api.EventTypeWarning},
				{Type: api.EventTypeNormal},
				{Type: ""},
			},
			false,
		},
	}

	for _, c := range cases {
		actual := isTypeFilled(c.events)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("isTypeFilled(%#v) == \n%#v\nexpected \n%#v\n",
				c.events, actual, c.expected)
		}
	}
}

func TestFillEventsType(t *testing.T) {
	cases := []struct {
		events   []api.Event
		expected []api.Event
	}{
		{nil, nil},
		{[]api.Event{}, []api.Event{}},
		{
			[]api.Event{
				{Reason: "failed"},
				{Reason: "test"},
			},
			[]api.Event{
				{Reason: "failed", Type: api.EventTypeWarning},
				{Reason: "test", Type: api.EventTypeNormal},
			},
		},
	}

	for _, c := range cases {
		actual := fillEventsType(c.events)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("fillEventsType(%#v) == \n%#v\nexpected \n%#v\n",
				c.events, actual, c.expected)
		}
	}
}

func TestIsFailedReason(t *testing.T) {
	cases := []struct {
		reason         string
		failedPartials []string
		expected       bool
	}{
		{"", nil, false},
		{"", []string{}, false},
		{"FailedReason", []string{"failed"}, true},
		{"ErrReason", []string{"failed"}, false},
		{"ErrReason", []string{"failed", "err"}, true},
	}

	for _, c := range cases {
		actual := isFailedReason(c.reason, c.failedPartials...)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("fillEventsType(%#v, %#v) == \n%#v\nexpected \n%#v\n",
				c.reason, c.failedPartials, actual, c.expected)
		}
	}
}
