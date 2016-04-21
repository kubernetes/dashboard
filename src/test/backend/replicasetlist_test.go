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

package main

import (
	"errors"
	"reflect"
	"testing"

	"k8s.io/kubernetes/pkg/api"
	k8serrors "k8s.io/kubernetes/pkg/api/errors"
	"k8s.io/kubernetes/pkg/api/unversioned"
	"k8s.io/kubernetes/pkg/apis/extensions"
)

func TestGetReplicaSetListFromChannels(t *testing.T) {
	cases := []struct {
		k8sRs         extensions.ReplicaSetList
		k8sRsError    error
		expected      *ReplicaSetList
		expectedError error
	}{
		{
			extensions.ReplicaSetList{},
			nil,
			&ReplicaSetList{[]ReplicaSet{}},
			nil,
		},
		{
			extensions.ReplicaSetList{},
			errors.New("MyCustomError"),
			nil,
			errors.New("MyCustomError"),
		},
		{
			extensions.ReplicaSetList{},
			&k8serrors.StatusError{},
			nil,
			&k8serrors.StatusError{},
		},
		{
			extensions.ReplicaSetList{},
			&k8serrors.StatusError{ErrStatus: unversioned.Status{}},
			nil,
			&k8serrors.StatusError{ErrStatus: unversioned.Status{}},
		},
		{
			extensions.ReplicaSetList{},
			&k8serrors.StatusError{ErrStatus: unversioned.Status{Reason: "foo-bar"}},
			nil,
			&k8serrors.StatusError{ErrStatus: unversioned.Status{Reason: "foo-bar"}},
		},
		{
			extensions.ReplicaSetList{},
			&k8serrors.StatusError{ErrStatus: unversioned.Status{Reason: "NotFound"}},
			nil,
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
				}},
			},
			nil,
			&ReplicaSetList{
				[]ReplicaSet{{
					Name:         "rs-name",
					Namespace:    "rs-namespace",
					Labels:       map[string]string{"key": "value"},
					CreationTime: unversioned.Unix(111, 222),
					Pods: ReplicationControllerPodInfo{
						Warnings: []Event(nil),
					},
				}},
			},
			nil,
		},
	}

	for _, c := range cases {
		channels := &ResourceChannels{
			ReplicaSetList: ReplicaSetListChannel{
				List:  make(chan *extensions.ReplicaSetList, 1),
				Error: make(chan error, 1),
			},
			NodeList: NodeListChannel{
				List:  make(chan *api.NodeList, 1),
				Error: make(chan error, 1),
			},
			ServiceList: ServiceListChannel{
				List:  make(chan *api.ServiceList, 1),
				Error: make(chan error, 1),
			},
			PodList: PodListChannel{
				List:  make(chan *api.PodList, 1),
				Error: make(chan error, 1),
			},
			EventList: EventListChannel{
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

		channels.PodList.List <- &api.PodList{}
		channels.PodList.Error <- nil

		channels.EventList.List <- &api.EventList{}
		channels.EventList.Error <- nil

		actual, err := GetReplicaSetListFromChannels(channels)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetReplicaSetListChannels() ==\n          %#v\nExpected: %#v", actual, c.expected)
		}
		if !reflect.DeepEqual(err, c.expectedError) {
			t.Errorf("GetReplicaSetListChannels() ==\n          %#v\nExpected: %#v", err, c.expectedError)
		}
	}
}
