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

	"k8s.io/kubernetes/pkg/api"
)

func TestFilterPodsBySelector(t *testing.T) {
	firstLabelSelectorMap := make(map[string]string)
	firstLabelSelectorMap["name"] = "app-name-first"
	secondLabelSelectorMap := make(map[string]string)
	secondLabelSelectorMap["name"] = "app-name-second"

	cases := []struct {
		selector map[string]string
		pods     []api.Pod
		expected []api.Pod
	}{
		{
			firstLabelSelectorMap,
			[]api.Pod{
				{
					ObjectMeta: api.ObjectMeta{
						Name:   "first-pod-ok",
						Labels: firstLabelSelectorMap,
					},
				},
				{
					ObjectMeta: api.ObjectMeta{
						Name:   "second-pod-ok",
						Labels: firstLabelSelectorMap,
					},
				},
				{
					ObjectMeta: api.ObjectMeta{
						Name:   "third-pod-wrong",
						Labels: secondLabelSelectorMap,
					},
				},
			},
			[]api.Pod{
				{
					ObjectMeta: api.ObjectMeta{
						Name:   "first-pod-ok",
						Labels: firstLabelSelectorMap,
					},
				},
				{
					ObjectMeta: api.ObjectMeta{
						Name:   "second-pod-ok",
						Labels: firstLabelSelectorMap,
					},
				},
			},
		},
	}
	for _, c := range cases {
		actual := FilterPodsBySelector(c.pods, c.selector)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("FilterPodsBySelector(%+v, %+v) == %+v, expected %+v",
				c.pods, c.selector, actual, c.expected)
		}
	}
}

func TestFilterNamespacedPodsBySelector(t *testing.T) {
	firstLabelSelectorMap := make(map[string]string)
	firstLabelSelectorMap["name"] = "app-name-first"
	secondLabelSelectorMap := make(map[string]string)
	secondLabelSelectorMap["name"] = "app-name-second"

	cases := []struct {
		selector  map[string]string
		namespace string
		pods      []api.Pod
		expected  []api.Pod
	}{
		{
			firstLabelSelectorMap, "test-ns-1",
			[]api.Pod{
				{
					ObjectMeta: api.ObjectMeta{
						Name:      "first-pod-ok",
						Labels:    firstLabelSelectorMap,
						Namespace: "test-ns-1",
					},
				},
				{
					ObjectMeta: api.ObjectMeta{
						Name:      "second-pod-ok",
						Labels:    firstLabelSelectorMap,
						Namespace: "test-ns-2",
					},
				},
				{
					ObjectMeta: api.ObjectMeta{
						Name:   "third-pod-wrong",
						Labels: secondLabelSelectorMap,
					},
				},
			},
			[]api.Pod{
				{
					ObjectMeta: api.ObjectMeta{
						Name:      "first-pod-ok",
						Labels:    firstLabelSelectorMap,
						Namespace: "test-ns-1",
					},
				},
			},
		},
	}

	for _, c := range cases {
		actual := FilterNamespacedPodsBySelector(c.pods, c.namespace, c.selector)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("FilterNamespacedPodsBySelector(%+v, %+v) == %+v, expected %+v",
				c.pods, c.selector, actual, c.expected)
		}
	}
}

func TestGetContainerImages(t *testing.T) {
	cases := []struct {
		podTemplate *api.PodSpec
		expected    []string
	}{
		{&api.PodSpec{}, nil},
		{
			&api.PodSpec{
				Containers: []api.Container{{Image: "container-1"}, {Image: "container-2"}},
			},
			[]string{"container-1", "container-2"},
		},
	}

	for _, c := range cases {
		actual := GetContainerImages(c.podTemplate)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetContainerImages(%+v) == %+v, expected %+v",
				c.podTemplate, actual, c.expected)
		}
	}
}
