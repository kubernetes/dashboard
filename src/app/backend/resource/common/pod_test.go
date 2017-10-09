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

package common

import (
	"reflect"
	"testing"

	batch "k8s.io/api/batch/v1"
	api "k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

type metaObj struct {
	metaV1.ObjectMeta
	metaV1.TypeMeta
}

func TestFilterPodsByControllerRef(t *testing.T) {
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
		obj      *metaObj
		pods     []api.Pod
		expected []api.Pod
	}{
		{
			&metaObj{
				ObjectMeta: metaV1.ObjectMeta{
					UID:  "uid-1",
					Name: "my-name-1",
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
		actual := FilterPodsByControllerRef(c.obj, c.pods)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("FilterPodsByControllerRef(%+v, %+v) == %+v, expected %+v",
				c.pods, c.obj, actual, c.expected)
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
				Containers: []api.Container{{Image: "container:v1"}, {Image: "container:v2"}},
			},
			[]string{"container:v1", "container:v2"},
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

func TestGetInitContainerImages(t *testing.T) {
	cases := []struct {
		podTemplate *api.PodSpec
		expected    []string
	}{
		{&api.PodSpec{}, nil},
		{
			&api.PodSpec{
				InitContainers: []api.Container{{Image: "initContainer:v3"}, {Image: "initContainer:v4"}},
			},
			[]string{"initContainer:v3", "initContainer:v4"},
		},
	}

	for _, c := range cases {
		actual := GetInitContainerImages(c.podTemplate)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetInitContainerImages(%+v) == %+v, expected %+v",
				c.podTemplate, actual, c.expected)
		}
	}
}

func TestGetContainerNames(t *testing.T) {
	cases := []struct {
		podTemplate *api.PodSpec
		expected    []string
	}{
		{&api.PodSpec{}, nil},
		{
			&api.PodSpec{
				Containers: []api.Container{{Name: "container"}, {Name: "container"}},
			},
			[]string{"container", "container"},
		},
	}

	for _, c := range cases {
		actual := GetContainerNames(c.podTemplate)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetContainerNames(%+v) == %+v, expected %+v",
				c.podTemplate, actual, c.expected)
		}
	}
}

func TestGetInitContainerNames(t *testing.T) {
	cases := []struct {
		podTemplate *api.PodSpec
		expected    []string
	}{
		{&api.PodSpec{}, nil},
		{
			&api.PodSpec{
				InitContainers: []api.Container{{Name: "initContainer"}, {Name: "initContainer"}},
			},
			[]string{"initContainer", "initContainer"},
		},
	}

	for _, c := range cases {
		actual := GetInitContainerNames(c.podTemplate)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetInitContainerNames(%+v) == %+v, expected %+v",
				c.podTemplate, actual, c.expected)
		}
	}
}

func TestFilterPodsForJob(t *testing.T) {
	cases := []struct {
		job      batch.Job
		pods     []api.Pod
		expected []api.Pod
	}{
		{
			batch.Job{
				ObjectMeta: metaV1.ObjectMeta{
					Namespace: "default",
					Name:      "job-1",
					UID:       "job-uid",
				},
				Spec: batch.JobSpec{
					Selector: &metaV1.LabelSelector{
						MatchLabels: map[string]string{"controller-uid": "job-uid"},
					},
				},
			},
			[]api.Pod{
				{
					ObjectMeta: metaV1.ObjectMeta{
						Name:      "pod-1",
						Namespace: "default",
						Labels:    map[string]string{"controller-uid": "job-uid"},
					},
				},
				{
					ObjectMeta: metaV1.ObjectMeta{
						Name:      "pod-2",
						Namespace: "default",
					},
				},
			},
			[]api.Pod{
				{
					ObjectMeta: metaV1.ObjectMeta{
						Name:      "pod-1",
						Namespace: "default",
						Labels:    map[string]string{"controller-uid": "job-uid"},
					},
				},
			},
		},
	}
	for _, c := range cases {
		actual := FilterPodsForJob(c.job, c.pods)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("FilterPodsForJob(%+v, %+v) == %+v, expected %+v",
				c.job, c.pods, actual, c.expected)
		}
	}
}
