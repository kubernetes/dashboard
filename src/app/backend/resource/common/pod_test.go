// Copyright 2017 The Kubernetes Dashboard Authors.
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
	batch "k8s.io/client-go/pkg/apis/batch/v1"
)

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
