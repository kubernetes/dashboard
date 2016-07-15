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

	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/api/unversioned"
	"k8s.io/kubernetes/pkg/apis/extensions"
	"k8s.io/kubernetes/pkg/client/unversioned/testclient"
)

func TestGetDaemonSetEvents(t *testing.T) {
	cases := []struct {
		namespace, name string
		eventList       *api.EventList
		podList         *api.PodList
		daemonSet       *extensions.DaemonSet
		expectedActions []string
		expected        *common.EventList
	}{
		{
			"test-namespace", "test-name",
			&api.EventList{Items: []api.Event{
				{Message: "test-message", ObjectMeta: api.ObjectMeta{Namespace: "test-namespace"}},
			}},
			&api.PodList{Items: []api.Pod{{ObjectMeta: api.ObjectMeta{Name: "test-pod"}}}},
			&extensions.DaemonSet{
				ObjectMeta: api.ObjectMeta{Name: "test-daemonset"},
				Spec: extensions.DaemonSetSpec{
					Selector: &unversioned.LabelSelector{
						MatchLabels: map[string]string{},
					}}},
			[]string{"list", "get", "list", "list"},
			&common.EventList{
				ListMeta:  common.ListMeta{TotalItems: 1},
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
		fakeClient := testclient.NewSimpleFake(c.eventList, c.daemonSet, c.podList,
			&api.EventList{})

		actual, _ := GetDaemonSetEvents(fakeClient, c.namespace, c.name)

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
			t.Errorf("GetDaemonSetEvents(client,%#v, %#v) == \ngot: %#v, \nexpected %#v",
				c.namespace, c.name, actual, c.expected)
		}
	}
}

func TestGetDaemonSetPodsEvents(t *testing.T) {
	cases := []struct {
		namespace, name string
		eventList       *api.EventList
		podList         *api.PodList
		daemonSet       *extensions.DaemonSet
		expectedActions []string
		expected        []api.Event
	}{
		{
			"test-namespace", "test-name",
			&api.EventList{Items: []api.Event{
				{Message: "test-message", ObjectMeta: api.ObjectMeta{Namespace: "test-namespace"}},
			}},
			&api.PodList{Items: []api.Pod{{ObjectMeta: api.ObjectMeta{Name: "test-pod", Namespace: "test-namespace"}}}},
			&extensions.DaemonSet{
				ObjectMeta: api.ObjectMeta{Name: "test-daemonset", Namespace: "test-namespace"},
				Spec: extensions.DaemonSetSpec{
					Selector: &unversioned.LabelSelector{
						MatchLabels: map[string]string{},
					}}},
			[]string{"get", "list", "list"},
			[]api.Event{{Message: "test-message", ObjectMeta: api.ObjectMeta{Namespace: "test-namespace"}}},
		},
	}

	for _, c := range cases {
		fakeClient := testclient.NewSimpleFake(c.daemonSet, c.podList, c.eventList)

		actual, _ := GetDaemonSetPodsEvents(fakeClient, c.namespace, c.name)

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
			t.Errorf("GetDaemonSetPodsEvents(client,%#v, %#v) == \ngot: %#v, \nexpected %#v",
				c.namespace, c.name, actual, c.expected)
		}
	}
}
