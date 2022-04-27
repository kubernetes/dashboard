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

package pod_test

import (
	"reflect"
	"testing"

	v1 "k8s.io/api/core/v1"
	k8serrors "k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/errors"
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/pod"
)

func TestGetPodListFromChannels(t *testing.T) {
	cases := []struct {
		k8sPod        v1.PodList
		k8sPodError   error
		pods          *v1.PodList
		expected      *pod.PodList
		expectedError error
	}{
		{
			v1.PodList{},
			nil,
			&v1.PodList{},
			&pod.PodList{
				ListMeta:          api.ListMeta{},
				Pods:              []pod.Pod{},
				CumulativeMetrics: make([]metricapi.Metric, 0),
				Errors:            []error{},
			},
			nil,
		},
		{
			v1.PodList{},
			errors.NewInvalid("MyCustomError"),
			&v1.PodList{},
			nil,
			errors.NewInvalid("MyCustomError"),
		},
		{
			v1.PodList{},
			&k8serrors.StatusError{},
			&v1.PodList{},
			nil,
			&k8serrors.StatusError{},
		},
		{
			v1.PodList{},
			&k8serrors.StatusError{ErrStatus: metav1.Status{}},
			&v1.PodList{},
			nil,
			&k8serrors.StatusError{ErrStatus: metav1.Status{}},
		},
		{
			v1.PodList{},
			&k8serrors.StatusError{ErrStatus: metav1.Status{Reason: "foo-bar"}},
			&v1.PodList{},
			nil,
			&k8serrors.StatusError{ErrStatus: metav1.Status{Reason: "foo-bar"}},
		},
		{
			v1.PodList{
				Items: []v1.Pod{{
					ObjectMeta: metav1.ObjectMeta{
						Name:              "pod-name",
						Namespace:         "pod-namespace",
						Labels:            map[string]string{"key": "value"},
						CreationTimestamp: metav1.Unix(111, 222),
					},
				}},
			},
			nil,
			&v1.PodList{},
			&pod.PodList{
				ListMeta:          api.ListMeta{TotalItems: 1},
				CumulativeMetrics: make([]metricapi.Metric, 0),
				Status:            common.ResourceStatus{Pending: 1},
				Pods: []pod.Pod{{
					ObjectMeta: api.ObjectMeta{
						Name:              "pod-name",
						Namespace:         "pod-namespace",
						Labels:            map[string]string{"key": "value"},
						CreationTimestamp: metav1.Unix(111, 222),
					},
					TypeMeta: api.TypeMeta{Kind: api.ResourceKindPod},
					Status:   string(v1.PodUnknown),
					Warnings: []common.Event{},
				}},
				Errors: []error{},
			},
			nil,
		},
	}

	for _, c := range cases {
		channels := &common.ResourceChannels{
			PodList: common.PodListChannel{
				List:  make(chan *v1.PodList, 1),
				Error: make(chan error, 1),
			},
			EventList: common.EventListChannel{
				List:  make(chan *v1.EventList, 1),
				Error: make(chan error, 1),
			},
		}

		channels.PodList.Error <- c.k8sPodError
		channels.PodList.List <- &c.k8sPod

		channels.EventList.List <- &v1.EventList{}
		channels.EventList.Error <- nil

		actual, err := pod.GetPodListFromChannels(channels, dataselect.NoDataSelect, nil)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetPodListFromChannels() ==\n          %#v\nExpected: %#v", actual, c.expected)
		}
		if !reflect.DeepEqual(err, c.expectedError) {
			t.Errorf("GetPodListFromChannels() ==\n          %#v\nExpected: %#v", err, c.expectedError)
		}
	}
}
