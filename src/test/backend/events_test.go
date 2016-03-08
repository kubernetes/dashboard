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
	"time"

	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/api/unversioned"
)

func TestAppendEvents(t *testing.T) {
	location, err := time.LoadLocation("Europe/Berlin")

	if err != nil {
		t.Errorf("AppendEvents(...) cannot load location")
	}

	cases := []struct {
		source   []api.Event
		target   Events
		expected Events
	}{
		{
			nil, Events{}, Events{},
		},
		{
			nil,
			Events{
				Namespace: "test-namespace",
			},
			Events{
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
			Events{
				Namespace: "test-namespace",
			},
			Events{
				Namespace: "test-namespace",
				Events: []Event{
					{
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
		actual := AppendEvents(c.source, c.target)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("AppendEvents(%#v, %#v) == %#v, expected %#v",
				c.source, c.target, actual, c.expected)
		}
	}
}
