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

package common

import (
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/resource/event"
	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/api/unversioned"
)

func TestIsSelectorMatching(t *testing.T) {
	cases := []struct {
		serviceSelector, replicationControllerSelector map[string]string
		expected                                       bool
	}{
		{nil, nil, false},
		{nil, map[string]string{}, false},
		{map[string]string{}, nil, false},
		{map[string]string{}, map[string]string{}, false},
		{map[string]string{"app": "my-name"}, map[string]string{}, false},
		{map[string]string{"app": "my-name", "version": "2"},
			map[string]string{"app": "my-name", "version": "1.1"}, false},
		{map[string]string{"app": "my-name", "env": "prod"},
			map[string]string{"app": "my-name", "version": "1.1"}, false},
		{map[string]string{"app": "my-name"}, map[string]string{"app": "my-name"}, true},
		{map[string]string{"app": "my-name", "version": "1.1"},
			map[string]string{"app": "my-name", "version": "1.1"}, true},
		{map[string]string{"app": "my-name"},
			map[string]string{"app": "my-name", "version": "1.1"}, true},
	}
	for _, c := range cases {
		actual := IsSelectorMatching(c.serviceSelector, c.replicationControllerSelector)
		if actual != c.expected {
			t.Errorf("isSelectorMatching(%+v, %+v) == %+v, expected %+v",
				c.serviceSelector, c.replicationControllerSelector, actual, c.expected)
		}
	}
}

func TestIsLabelSelectorMatching(t *testing.T) {
	cases := []struct {
		serviceSelector   map[string]string
		daemonSetselector *unversioned.LabelSelector
		expected          bool
	}{
		{nil, nil, false},
		{nil, &unversioned.LabelSelector{MatchLabels: map[string]string{}}, false},
		{map[string]string{}, nil, false},
		{map[string]string{}, &unversioned.LabelSelector{MatchLabels: map[string]string{}},
			false},
		{map[string]string{"app": "my-name"},
			&unversioned.LabelSelector{MatchLabels: map[string]string{}},
			false},
		{map[string]string{"app": "my-name", "version": "2"},
			&unversioned.LabelSelector{MatchLabels: map[string]string{"app": "my-name", "version": "1.1"}},
			false},
		{map[string]string{"app": "my-name", "env": "prod"},
			&unversioned.LabelSelector{MatchLabels: map[string]string{"app": "my-name", "version": "1.1"}},
			false},
		{map[string]string{"app": "my-name"},
			&unversioned.LabelSelector{MatchLabels: map[string]string{"app": "my-name"}},
			true},
		{map[string]string{"app": "my-name", "version": "1.1"},
			&unversioned.LabelSelector{MatchLabels: map[string]string{"app": "my-name", "version": "1.1"}},
			true},
		{map[string]string{"app": "my-name"},
			&unversioned.LabelSelector{MatchLabels: map[string]string{"app": "my-name", "version": "1.1"}},
			true},
	}
	for _, c := range cases {
		actual := common.IsLabelSelectorMatching(c.serviceSelector, c.daemonSetselector)
		if actual != c.expected {
			t.Errorf("isLabelSelectorMatching(%+v, %+v) == %+v, expected %+v",
				c.serviceSelector, c.daemonSetselector, actual, c.expected)
		}
	}
}

func TestGetPodInfo(t *testing.T) {
	cases := []struct {
		current, desired int
		pods             []api.Pod
		expected         PodInfo
	}{
		{
			5,
			4,
			[]api.Pod{
				{
					Status: api.PodStatus{
						Phase: api.PodRunning,
					},
				},
			},
			PodInfo{
				Current:  5,
				Desired:  4,
				Running:  1,
				Pending:  0,
				Failed:   0,
				Warnings: make([]event.Event, 0),
			},
		},
	}

	for _, c := range cases {
		actual := GetPodInfo(c.current, c.desired, c.pods)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getPodInfo(%#v, %#v, %#v) == \n%#v\nexpected \n%#v\n",
				c.current, c.desired, c.pods, actual, c.expected)
		}
	}
}

func TestGetMatchingPods(t *testing.T) {
	cases := []struct {
		labelSelector *unversioned.LabelSelector
		namespace     string
		pods          []api.Pod
		expected      []api.Pod
	}{
		{nil, api.NamespaceDefault, nil, nil},
		{nil, api.NamespaceDefault, []api.Pod{}, nil},
		{nil, api.NamespaceDefault, []api.Pod{{}}, nil},
		{&unversioned.LabelSelector{}, api.NamespaceDefault, []api.Pod{{
			ObjectMeta: api.ObjectMeta{Labels: map[string]string{"foo": "bar"}},
		}}, nil},
		{
			&unversioned.LabelSelector{},
			api.NamespaceDefault,
			[]api.Pod{{
				ObjectMeta: api.ObjectMeta{
					Labels:    map[string]string{"foo": "bar"},
					Namespace: api.NamespaceDefault,
				},
			}},
			[]api.Pod{{
				ObjectMeta: api.ObjectMeta{
					Labels:    map[string]string{"foo": "bar"},
					Namespace: api.NamespaceDefault,
				},
			}},
		},
	}
	for _, c := range cases {
		actual := GetMatchingPods(c.labelSelector, c.namespace, c.pods)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetMatchingPods(%+v, %+v, %+v) == %+v, expected %+v",
				c.labelSelector, c.namespace, c.pods, actual, c.expected)
		}
	}
}
