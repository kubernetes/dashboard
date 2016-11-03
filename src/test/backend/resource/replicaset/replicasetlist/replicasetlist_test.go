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

package replicasetlist

import (
	"errors"
	"reflect"
	"testing"

	"k8s.io/kubernetes/pkg/api"
	k8serrors "k8s.io/kubernetes/pkg/api/errors"
	"k8s.io/kubernetes/pkg/api/unversioned"
	"k8s.io/kubernetes/pkg/apis/extensions"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/metric"
	"github.com/kubernetes/dashboard/src/app/backend/resource/replicaset"
)

func TestGetReplicaSetListFromChannels(t *testing.T) {
	cases := []struct {
		k8sRs         extensions.ReplicaSetList
		k8sRsError    error
		pods          *api.PodList
		expected      *ReplicaSetList
		expectedError error
	}{
		{
			extensions.ReplicaSetList{},
			nil,
			&api.PodList{},
			&ReplicaSetList{
				ListMeta:          common.ListMeta{},
				CumulativeMetrics: make([]metric.Metric, 0),
				ReplicaSets:       []replicaset.ReplicaSet{}},
			nil,
		},
		{
			extensions.ReplicaSetList{},
			errors.New("MyCustomError"),
			&api.PodList{},
			nil,
			errors.New("MyCustomError"),
		},
		{
			extensions.ReplicaSetList{},
			&k8serrors.StatusError{},
			&api.PodList{},
			nil,
			&k8serrors.StatusError{},
		},
		{
			extensions.ReplicaSetList{},
			&k8serrors.StatusError{ErrStatus: unversioned.Status{}},
			&api.PodList{},
			nil,
			&k8serrors.StatusError{ErrStatus: unversioned.Status{}},
		},
		{
			extensions.ReplicaSetList{},
			&k8serrors.StatusError{ErrStatus: unversioned.Status{Reason: "foo-bar"}},
			&api.PodList{},
			nil,
			&k8serrors.StatusError{ErrStatus: unversioned.Status{Reason: "foo-bar"}},
		},
		{
			extensions.ReplicaSetList{},
			&k8serrors.StatusError{ErrStatus: unversioned.Status{Reason: "NotFound"}},
			&api.PodList{},
			&ReplicaSetList{
				ReplicaSets: make([]replicaset.ReplicaSet, 0),
			},
			nil,
		},
		{
			extensions.ReplicaSetList{
				Items: []extensions.ReplicaSet{{
					ObjectMeta: api.ObjectMeta{
						Name:              "rs-name",
						Namespace:         "rs-namespace",
						Labels:            map[string]string{"key": "value"},
						CreationTimestamp: unversioned.Unix(111, 222),
					},
					Spec: extensions.ReplicaSetSpec{
						Selector: &unversioned.LabelSelector{MatchLabels: map[string]string{"foo": "bar"}},
						Replicas: 21,
					},
					Status: extensions.ReplicaSetStatus{
						Replicas: 7,
					},
				}},
			},
			nil,
			&api.PodList{
				Items: []api.Pod{
					{
						ObjectMeta: api.ObjectMeta{
							Namespace: "rs-namespace",
							Labels:    map[string]string{"foo": "bar"},
						},
						Status: api.PodStatus{Phase: api.PodFailed},
					},
					{
						ObjectMeta: api.ObjectMeta{
							Namespace: "rs-namespace",
							Labels:    map[string]string{"foo": "baz"},
						},
						Status: api.PodStatus{Phase: api.PodFailed},
					},
				},
			},
			&ReplicaSetList{
				ListMeta:          common.ListMeta{TotalItems: 1},
				CumulativeMetrics: make([]metric.Metric, 0),
				ReplicaSets: []replicaset.ReplicaSet{{
					ObjectMeta: common.ObjectMeta{
						Name:              "rs-name",
						Namespace:         "rs-namespace",
						Labels:            map[string]string{"key": "value"},
						CreationTimestamp: unversioned.Unix(111, 222),
					},
					TypeMeta: common.TypeMeta{Kind: common.ResourceKindReplicaSet},
					Pods: common.PodInfo{
						Current:  7,
						Desired:  21,
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
			ReplicaSetList: common.ReplicaSetListChannel{
				List:  make(chan *extensions.ReplicaSetList, 1),
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

		channels.ReplicaSetList.Error <- c.k8sRsError
		channels.ReplicaSetList.List <- &c.k8sRs

		channels.NodeList.List <- &api.NodeList{}
		channels.NodeList.Error <- nil

		channels.ServiceList.List <- &api.ServiceList{}
		channels.ServiceList.Error <- nil

		channels.PodList.List <- c.pods
		channels.PodList.Error <- nil

		channels.EventList.List <- &api.EventList{}
		channels.EventList.Error <- nil

		actual, err := GetReplicaSetListFromChannels(channels, dataselect.NoDataSelect, nil)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetReplicaSetListChannels() ==\n          %#v\nExpected: %#v", actual, c.expected)
		}
		if !reflect.DeepEqual(err, c.expectedError) {
			t.Errorf("GetReplicaSetListChannels() ==\n          %#v\nExpected: %#v", err, c.expectedError)
		}
	}
}

func TestCreateReplicaSetList(t *testing.T) {
	cases := []struct {
		replicaSets []extensions.ReplicaSet
		pods        []api.Pod
		events      []api.Event
		expected    *ReplicaSetList
	}{
		{
			[]extensions.ReplicaSet{
				{
					ObjectMeta: api.ObjectMeta{Name: "replica-set", Namespace: "ns-1"},
					Spec: extensions.ReplicaSetSpec{Selector: &unversioned.LabelSelector{
						MatchLabels: map[string]string{"key": "value"},
					}},
				},
			},
			[]api.Pod{},
			[]api.Event{},
			&ReplicaSetList{
				ListMeta:          common.ListMeta{TotalItems: 1},
				CumulativeMetrics: make([]metric.Metric, 0),
				ReplicaSets: []replicaset.ReplicaSet{
					{
						ObjectMeta: common.ObjectMeta{Name: "replica-set", Namespace: "ns-1"},
						TypeMeta:   common.TypeMeta{Kind: common.ResourceKindReplicaSet},
						Pods:       common.PodInfo{Warnings: []common.Event{}},
					},
				},
			},
		},
	}

	for _, c := range cases {
		actual := CreateReplicaSetList(c.replicaSets, c.pods, c.events, dataselect.NoDataSelect, nil)

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("CreateReplicaSetList(%#v, %#v, %#v, ...) == \ngot %#v, \nexpected %#v",
				c.replicaSets, c.pods, c.events, actual, c.expected)
		}
	}
}
