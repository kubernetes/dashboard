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

package statefulset

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
	apps "k8s.io/client-go/pkg/apis/apps/v1beta1"
)

func getReplicasPointer(replicas int32) *int32 {
	return &replicas
}

func TestGetStatefulSetListFromChannels(t *testing.T) {
	controller := true
	cases := []struct {
		k8sRs         apps.StatefulSetList
		k8sRsError    error
		pods          *api.PodList
		expected      *StatefulSetList
		expectedError error
	}{
		{
			apps.StatefulSetList{},
			nil,
			&api.PodList{},
			&StatefulSetList{
				ListMeta:          common.ListMeta{},
				CumulativeMetrics: make([]metric.Metric, 0),
				StatefulSets:      []StatefulSet{}},
			nil,
		},
		{
			apps.StatefulSetList{},
			errors.New("MyCustomError"),
			&api.PodList{},
			nil,
			errors.New("MyCustomError"),
		},
		{
			apps.StatefulSetList{},
			&k8serrors.StatusError{},
			&api.PodList{},
			nil,
			&k8serrors.StatusError{},
		},
		{
			apps.StatefulSetList{},
			&k8serrors.StatusError{ErrStatus: metaV1.Status{}},
			&api.PodList{},
			nil,
			&k8serrors.StatusError{ErrStatus: metaV1.Status{}},
		},
		{
			apps.StatefulSetList{},
			&k8serrors.StatusError{ErrStatus: metaV1.Status{Reason: "foo-bar"}},
			&api.PodList{},
			nil,
			&k8serrors.StatusError{ErrStatus: metaV1.Status{Reason: "foo-bar"}},
		},
		{
			apps.StatefulSetList{},
			&k8serrors.StatusError{ErrStatus: metaV1.Status{Reason: "NotFound"}},
			&api.PodList{},
			&StatefulSetList{
				StatefulSets: make([]StatefulSet, 0),
			},
			nil,
		},
		{
			apps.StatefulSetList{
				Items: []apps.StatefulSet{{
					ObjectMeta: metaV1.ObjectMeta{
						Name:              "rs-name",
						Namespace:         "rs-namespace",
						UID:               "uid",
						Labels:            map[string]string{"key": "value"},
						CreationTimestamp: metaV1.Unix(111, 222),
					},
					Spec: apps.StatefulSetSpec{
						Selector: &metaV1.LabelSelector{MatchLabels: map[string]string{"foo": "bar"}},
						Replicas: getReplicasPointer(21),
					},
					Status: apps.StatefulSetStatus{
						Replicas: 7,
					},
				}},
			},
			nil,
			&api.PodList{
				Items: []api.Pod{
					{
						ObjectMeta: metaV1.ObjectMeta{
							Namespace: "rs-namespace",
							Labels:    map[string]string{"foo": "baz"},
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
					{
						ObjectMeta: metaV1.ObjectMeta{
							Namespace: "rs-namespace",
							Labels:    map[string]string{"foo": "bar"},
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
				},
			},
			&StatefulSetList{
				ListMeta:          common.ListMeta{TotalItems: 1},
				CumulativeMetrics: make([]metric.Metric, 0),
				StatefulSets: []StatefulSet{{
					ObjectMeta: common.ObjectMeta{
						Name:              "rs-name",
						Namespace:         "rs-namespace",
						Labels:            map[string]string{"key": "value"},
						CreationTimestamp: metaV1.Unix(111, 222),
					},
					TypeMeta: common.TypeMeta{Kind: common.ResourceKindStatefulSet},
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
			StatefulSetList: common.StatefulSetListChannel{
				List:  make(chan *apps.StatefulSetList, 1),
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

		channels.StatefulSetList.Error <- c.k8sRsError
		channels.StatefulSetList.List <- &c.k8sRs

		channels.NodeList.List <- &api.NodeList{}
		channels.NodeList.Error <- nil

		channels.ServiceList.List <- &api.ServiceList{}
		channels.ServiceList.Error <- nil

		channels.PodList.List <- c.pods
		channels.PodList.Error <- nil

		channels.EventList.List <- &api.EventList{}
		channels.EventList.Error <- nil

		actual, err := GetStatefulSetListFromChannels(channels, dataselect.NoDataSelect, nil)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetStatefulSetListChannels() ==\n          %#v\nExpected: %#v", actual, c.expected)
		}
		if !reflect.DeepEqual(err, c.expectedError) {
			t.Errorf("GetStatefulSetListChannels() ==\n          %#v\nExpected: %#v", err, c.expectedError)
		}
	}
}
