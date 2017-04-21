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

	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/types"
	api "k8s.io/client-go/pkg/api/v1"
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
					ObjectMeta: metaV1.ObjectMeta{
						Name:   "first-pod-ok",
						Labels: firstLabelSelectorMap,
					},
				},
				{
					ObjectMeta: metaV1.ObjectMeta{
						Name:   "second-pod-ok",
						Labels: firstLabelSelectorMap,
					},
				},
				{
					ObjectMeta: metaV1.ObjectMeta{
						Name:   "third-pod-wrong",
						Labels: secondLabelSelectorMap,
					},
				},
			},
			[]api.Pod{
				{
					ObjectMeta: metaV1.ObjectMeta{
						Name:   "first-pod-ok",
						Labels: firstLabelSelectorMap,
					},
				},
				{
					ObjectMeta: metaV1.ObjectMeta{
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

func TestFilterPodsByOwnerReference(t *testing.T) {
	controller := true
	okOwnerRef := []metaV1.OwnerReference{{
		Kind:       "ReplicationController",
		Name:       "my-name-1",
		UID:        "uid-1",
		Controller: &controller,
	}}
	nokOwnerRef := []metaV1.OwnerReference{{
		Kind:       "ReplicationController",
		Name:       "my-name-1",
		UID:        "",
		Controller: &controller,
	}}
	cases := []struct {
		namespace string
		uid       types.UID
		pods      []api.Pod
		expected  []api.Pod
	}{
		{
			"default",
			"uid-1",
			[]api.Pod{
				{
					ObjectMeta: metaV1.ObjectMeta{
						Name:            "first-pod-ok",
						Namespace:       "default",
						OwnerReferences: okOwnerRef,
					},
				},
				{
					ObjectMeta: metaV1.ObjectMeta{
						Name:            "second-pod-ok",
						Namespace:       "default",
						OwnerReferences: okOwnerRef,
					},
				},
				{
					ObjectMeta: metaV1.ObjectMeta{
						Name:            "third-pod-nok",
						Namespace:       "default",
						OwnerReferences: nokOwnerRef,
					},
				},
			},
			[]api.Pod{
				{
					ObjectMeta: metaV1.ObjectMeta{
						Name:            "first-pod-ok",
						Namespace:       "default",
						OwnerReferences: okOwnerRef,
					},
				},
				{
					ObjectMeta: metaV1.ObjectMeta{
						Name:            "second-pod-ok",
						Namespace:       "default",
						OwnerReferences: okOwnerRef,
					},
				},
			},
		},
	}
	for _, c := range cases {
		actual := FilterPodsByOwnerReference(c.namespace, c.uid, c.pods)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("FilterPodsByOwnerReference(%+v, %+v, %+v) == %+v, expected %+v",
				c.pods, c.namespace, c.uid, actual, c.expected)
		}
	}
}
