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

package event

import (
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	apps "k8s.io/api/apps/v1beta2"
	"k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes/fake"
)

func TestGetEvents(t *testing.T) {
	cases := []struct {
		namespace       string
		name            string
		eventList       *v1.EventList
		expectedActions []string
		expected        []v1.Event
	}{
		{
			"ns-1", "ev-1",
			&v1.EventList{Items: []v1.Event{
				{Message: "test-message", ObjectMeta: metaV1.ObjectMeta{
					Name: "ev-1", Namespace: "ns-1", Labels: map[string]string{"app": "test"},
				}},
			}},
			[]string{"list"},
			[]v1.Event{
				{Message: "test-message", ObjectMeta: metaV1.ObjectMeta{
					Name: "ev-1", Namespace: "ns-1", Labels: map[string]string{"app": "test"},
				}, Type: v1.EventTypeNormal},
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

func TestToEventList(t *testing.T) {
	cases := []struct {
		events    []v1.Event
		namespace string
		expected  common.EventList
	}{
		{
			[]v1.Event{
				{ObjectMeta: metaV1.ObjectMeta{Name: "event-1"}},
				{ObjectMeta: metaV1.ObjectMeta{Name: "event-2"}},
			},
			"namespace-1",
			common.EventList{
				ListMeta: api.ListMeta{TotalItems: 2},
				Events: []common.Event{
					{
						ObjectMeta: api.ObjectMeta{Name: "event-1"},
						TypeMeta:   api.TypeMeta{api.ResourceKindEvent},
					},
					{
						ObjectMeta: api.ObjectMeta{Name: "event-2"},
						TypeMeta:   api.TypeMeta{api.ResourceKindEvent},
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

func TestGetResourceEvents(t *testing.T) {
	labelSelector := map[string]string{"app": "test"}

	cases := []struct {
		namespace, name string
		eventList       *v1.EventList
		podList         *v1.PodList
		replicaSet      *apps.ReplicaSet
		expectedActions []string
		expected        *common.EventList
	}{
		{
			"ns-1", "rs-1",
			&v1.EventList{Items: []v1.Event{
				{Message: "test-message", ObjectMeta: metaV1.ObjectMeta{
					Name: "ev-1", Namespace: "ns-1", Labels: labelSelector}},
			}},
			&v1.PodList{Items: []v1.Pod{{ObjectMeta: metaV1.ObjectMeta{
				Name: "pod-1", Namespace: "ns-1"}}}},
			&apps.ReplicaSet{
				ObjectMeta: metaV1.ObjectMeta{
					Name: "rs-1", Namespace: "ns-1", Labels: labelSelector},
				Spec: apps.ReplicaSetSpec{
					Selector: &metaV1.LabelSelector{
						MatchLabels: labelSelector,
					}}},
			[]string{"list"},
			&common.EventList{
				ListMeta: api.ListMeta{TotalItems: 1},
				Events: []common.Event{{
					TypeMeta: api.TypeMeta{Kind: api.ResourceKindEvent},
					ObjectMeta: api.ObjectMeta{
						Name: "ev-1", Namespace: "ns-1", Labels: labelSelector},
					Message: "test-message",
					Type:    v1.EventTypeNormal,
				}}},
		},
	}

	for _, c := range cases {
		fakeClient := fake.NewSimpleClientset(c.eventList, c.replicaSet, c.podList)

		actual, _ := GetResourceEvents(fakeClient, dataselect.NoDataSelect, c.namespace, c.name)

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
			t.Errorf("GetEvents(client,metricClient,%#v, %#v) == \ngot: %#v, \nexpected %#v",
				c.namespace, c.name, actual, c.expected)
		}
	}
}
