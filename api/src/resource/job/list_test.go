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

package job

import (
	"reflect"
	"testing"

	batch "k8s.io/api/batch/v1"
	v1 "k8s.io/api/core/v1"
	k8serrors "k8s.io/apimachinery/pkg/api/errors"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/errors"
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
)

func TestGetJobListFromChannels(t *testing.T) {
	var completions int32 = 21
	controller := true
	cases := []struct {
		k8sRs         batch.JobList
		k8sRsError    error
		pods          *v1.PodList
		expected      *JobList
		expectedError error
	}{
		{
			batch.JobList{},
			nil,
			&v1.PodList{},
			&JobList{
				ListMeta:          api.ListMeta{},
				Status:            common.ResourceStatus{},
				CumulativeMetrics: make([]metricapi.Metric, 0),
				Jobs:              []Job{},
				Errors:            []error{},
			},
			nil,
		},
		{
			batch.JobList{},
			errors.NewInvalid("MyCustomError"),
			&v1.PodList{},
			nil,
			errors.NewInvalid("MyCustomError"),
		},
		{
			batch.JobList{},
			&k8serrors.StatusError{},
			&v1.PodList{},
			nil,
			&k8serrors.StatusError{},
		},
		{
			batch.JobList{},
			&k8serrors.StatusError{ErrStatus: metaV1.Status{}},
			&v1.PodList{},
			nil,
			&k8serrors.StatusError{ErrStatus: metaV1.Status{}},
		},
		{
			batch.JobList{},
			&k8serrors.StatusError{ErrStatus: metaV1.Status{Reason: "foo-bar"}},
			&v1.PodList{},
			nil,
			&k8serrors.StatusError{ErrStatus: metaV1.Status{Reason: "foo-bar"}},
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
						Completions: &completions,
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
							Selector:    &metaV1.LabelSelector{MatchLabels: map[string]string{"foo": "bar"}},
							Completions: &completions,
						},
						Status: batch.JobStatus{
							Active: 7,
							Conditions: []batch.JobCondition{{
								Type:   batch.JobFailed,
								Status: v1.ConditionTrue,
							}},
						},
					},
				},
			},
			nil,
			&v1.PodList{
				Items: []v1.Pod{
					{
						ObjectMeta: metaV1.ObjectMeta{
							Namespace: "rs-namespace",
							Labels:    map[string]string{"foo": "bar"},
							OwnerReferences: []metaV1.OwnerReference{
								{
									Name:       "rs-name-failed-pod",
									UID:        "uid",
									Controller: &controller,
								},
							},
						},
						Status: v1.PodStatus{Phase: v1.PodFailed},
					},
					{
						ObjectMeta: metaV1.ObjectMeta{
							Namespace: "rs-namespace",
							Labels:    map[string]string{"foo": "bar"},
							OwnerReferences: []metaV1.OwnerReference{
								{
									Name:       "rs-name-running-pod",
									UID:        "uid",
									Controller: &controller,
								},
							},
						},
						Status: v1.PodStatus{Phase: v1.PodRunning},
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
						Status: v1.PodStatus{Phase: v1.PodFailed},
					},
				},
			},
			&JobList{
				ListMeta:          api.ListMeta{TotalItems: 2},
				CumulativeMetrics: make([]metricapi.Metric, 0),
				Status:            common.ResourceStatus{Running: 1, Failed: 1},
				Jobs: []Job{{
					ObjectMeta: api.ObjectMeta{
						Name:              "rs-name",
						Namespace:         "rs-namespace",
						UID:               "uid",
						Labels:            map[string]string{"key": "value"},
						CreationTimestamp: metaV1.Unix(111, 222),
					},
					TypeMeta: api.TypeMeta{Kind: api.ResourceKindJob},
					Pods: common.PodInfo{
						Current:  7,
						Running:  1,
						Desired:  &completions,
						Failed:   1,
						Warnings: []common.Event{},
					},
					JobStatus: JobStatus{
						Status: JobStatusRunning,
					},
				}, {
					ObjectMeta: api.ObjectMeta{
						Name:              "rs-name",
						Namespace:         "rs-namespace",
						UID:               "uid",
						Labels:            map[string]string{"key": "value"},
						CreationTimestamp: metaV1.Unix(111, 222),
					},
					TypeMeta: api.TypeMeta{Kind: api.ResourceKindJob},
					Pods: common.PodInfo{
						Current:  7,
						Running:  1,
						Desired:  &completions,
						Failed:   1,
						Warnings: []common.Event{},
					},
					JobStatus: JobStatus{
						Status: JobStatusFailed,
						Conditions: []common.Condition{{
							Type:   string(batch.JobFailed),
							Status: v1.ConditionTrue,
						}},
					},
				}},
				Errors: []error{},
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
				List:  make(chan *v1.NodeList, 1),
				Error: make(chan error, 1),
			},
			ServiceList: common.ServiceListChannel{
				List:  make(chan *v1.ServiceList, 1),
				Error: make(chan error, 1),
			},
			PodList: common.PodListChannel{
				List:  make(chan *v1.PodList, 1),
				Error: make(chan error, 1),
			},
			EventList: common.EventListChannel{
				List:  make(chan *v1.EventList, 1),
				Error: make(chan error, 1),
			},
		}

		channels.JobList.Error <- c.k8sRsError
		channels.JobList.List <- &c.k8sRs

		channels.NodeList.List <- &v1.NodeList{}
		channels.NodeList.Error <- nil

		channels.ServiceList.List <- &v1.ServiceList{}
		channels.ServiceList.Error <- nil

		channels.PodList.List <- c.pods
		channels.PodList.Error <- nil

		channels.EventList.List <- &v1.EventList{}
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
