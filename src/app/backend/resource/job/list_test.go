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

package job

import (
	"errors"
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/metric"
	k8serrors "k8s.io/apimachinery/pkg/api/errors"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	api "k8s.io/client-go/pkg/api/v1"
	batch "k8s.io/client-go/pkg/apis/batch/v1"
)

func TestGetJobListFromChannels(t *testing.T) {
	var jobCompletions int32 = 21
	controller := true
	cases := []struct {
		k8sRs         batch.JobList
		k8sRsError    error
		pods          *api.PodList
		expected      *JobList
		expectedError error
	}{
		{
			batch.JobList{},
			nil,
			&api.PodList{},
			&JobList{
				ListMeta:          common.ListMeta{},
				CumulativeMetrics: make([]metric.Metric, 0),
				Jobs:              []Job{}},
			nil,
		},
		{
			batch.JobList{},
			errors.New("MyCustomError"),
			&api.PodList{},
			nil,
			errors.New("MyCustomError"),
		},
		{
			batch.JobList{},
			&k8serrors.StatusError{},
			&api.PodList{},
			nil,
			&k8serrors.StatusError{},
		},
		{
			batch.JobList{},
			&k8serrors.StatusError{ErrStatus: metaV1.Status{}},
			&api.PodList{},
			nil,
			&k8serrors.StatusError{ErrStatus: metaV1.Status{}},
		},
		{
			batch.JobList{},
			&k8serrors.StatusError{ErrStatus: metaV1.Status{Reason: "foo-bar"}},
			&api.PodList{},
			nil,
			&k8serrors.StatusError{ErrStatus: metaV1.Status{Reason: "foo-bar"}},
		},
		{
			batch.JobList{},
			&k8serrors.StatusError{ErrStatus: metaV1.Status{Reason: "NotFound"}},
			&api.PodList{},
			&JobList{
				Jobs: make([]Job, 0),
			},
			nil,
		},
		{
			batch.JobList{
				Items: []batch.Job{{
					ObjectMeta: metaV1.ObjectMeta{
						Name:              "rs-name",
						Namespace:         "rs-namespace",
						Labels:            map[string]string{"key": "value"},
						UID:               "uid",
						CreationTimestamp: metaV1.Unix(111, 222),
					},
					Spec: batch.JobSpec{
						Selector:    &metaV1.LabelSelector{MatchLabels: map[string]string{"foo": "bar"}},
						Completions: &jobCompletions,
					},
					Status: batch.JobStatus{
						Active: 7,
					},
				},
					{
						ObjectMeta: metaV1.ObjectMeta{
							Name:              "rs-name",
							Namespace:         "rs-namespace",
							Labels:            map[string]string{"key": "value"},
							UID:               "uid",
							CreationTimestamp: metaV1.Unix(111, 222),
						},
						Spec: batch.JobSpec{
							Selector: &metaV1.LabelSelector{MatchLabels: map[string]string{"foo": "bar"}},
						},
						Status: batch.JobStatus{
							Active: 7,
						},
					},
				},
			},
			nil,
			&api.PodList{
				Items: []api.Pod{
					{
						ObjectMeta: metaV1.ObjectMeta{
							Namespace: "rs-namespace",
							OwnerReferences: []metaV1.OwnerReference{
								{
									Name:       "rs-name",
									UID:        "uid",
									Controller: &controller,
								},
							},
						},
						Status: api.PodStatus{Phase: api.PodFailed},
					},
					{
						ObjectMeta: metaV1.ObjectMeta{
							Namespace: "rs-namespace",
							OwnerReferences: []metaV1.OwnerReference{
								{
									Name:       "rs-name-wrong",
									UID:        "uid-wrong",
									Controller: &controller,
								},
							},
						},
						Status: api.PodStatus{Phase: api.PodFailed},
					},
				},
			},
			&JobList{
				ListMeta:          common.ListMeta{TotalItems: 2},
				CumulativeMetrics: make([]metric.Metric, 0),
				Jobs: []Job{{
					ObjectMeta: common.ObjectMeta{
						Name:              "rs-name",
						Namespace:         "rs-namespace",
						Labels:            map[string]string{"key": "value"},
						CreationTimestamp: metaV1.Unix(111, 222),
					},
					TypeMeta: common.TypeMeta{Kind: common.ResourceKindJob},
					Pods: common.PodInfo{
						Current:  7,
						Desired:  21,
						Failed:   1,
						Warnings: []common.Event{},
					},
				}, {
					ObjectMeta: common.ObjectMeta{
						Name:              "rs-name",
						Namespace:         "rs-namespace",
						Labels:            map[string]string{"key": "value"},
						CreationTimestamp: metaV1.Unix(111, 222),
					},
					TypeMeta: common.TypeMeta{Kind: common.ResourceKindJob},
					Pods: common.PodInfo{
						Current:  7,
						Desired:  0,
						Failed:   1,
						Warnings: []common.Event{},
					},
				}},
			},
			nil,
		},
	}

	for _, c := range cases {
		channels := &common.ResourceChannels{
			JobList: common.JobListChannel{
				List:  make(chan *batch.JobList, 1),
				Error: make(chan error, 1),
			},
			NodeList: common.NodeListChannel{
				List:  make(chan *api.NodeList, 1),
				Error: make(chan error, 1),
			},
			ServiceList: common.ServiceListChannel{
				List:  make(chan *api.ServiceList, 1),
				Error: make(chan error, 1),
			},
			PodList: common.PodListChannel{
				List:  make(chan *api.PodList, 1),
				Error: make(chan error, 1),
			},
			EventList: common.EventListChannel{
				List:  make(chan *api.EventList, 1),
				Error: make(chan error, 1),
			},
		}

		channels.JobList.Error <- c.k8sRsError
		channels.JobList.List <- &c.k8sRs

		channels.NodeList.List <- &api.NodeList{}
		channels.NodeList.Error <- nil

		channels.ServiceList.List <- &api.ServiceList{}
		channels.ServiceList.Error <- nil

		channels.PodList.List <- c.pods
		channels.PodList.Error <- nil

		channels.EventList.List <- &api.EventList{}
		channels.EventList.Error <- nil

		actual, err := GetJobListFromChannels(channels, dataselect.NoDataSelect, nil)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetJobListFromChannels() ==\n          %#v\nExpected: %#v", actual, c.expected)
		}
		if !reflect.DeepEqual(err, c.expectedError) {
			t.Errorf("GetJobListFromChannels() ==\n          %#v\nExpected: %#v", err, c.expectedError)
		}
	}
}
