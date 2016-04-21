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

package workload

import (
	"reflect"
	"testing"

	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/apis/extensions"
)

func TestGetWorkloadsFromChannels(t *testing.T) {
	cases := []struct {
		k8sRs extensions.ReplicaSetList
		k8sRc api.ReplicationControllerList
		rcs   []ReplicationController
		rs    []ReplicaSet
	}{
		{
			extensions.ReplicaSetList{},
			api.ReplicationControllerList{},
			[]ReplicationController{},
			[]ReplicaSet{},
		},
		{
			extensions.ReplicaSetList{
				Items: []extensions.ReplicaSet{{ObjectMeta: api.ObjectMeta{Name: "rs-name"}}},
			},
			api.ReplicationControllerList{
				Items: []api.ReplicationController{{
					ObjectMeta: api.ObjectMeta{Name: "rc-name"},
					Spec: api.ReplicationControllerSpec{
						Template: &api.PodTemplateSpec{},
					},
				}},
			},
			[]ReplicationController{{
				Name: "rc-name",
				Pods: ReplicationControllerPodInfo{
					Warnings: []Event{},
				},
			}},
			[]ReplicaSet{{
				Name: "rs-name",
				Pods: ReplicationControllerPodInfo{
					Warnings: []Event(nil),
				},
			}},
		},
	}

	for _, c := range cases {
		expected := &Workloads{
			ReplicationControllerList: ReplicationControllerList{
				ReplicationControllers: c.rcs,
			},
			ReplicaSetList: ReplicaSetList{
				ReplicaSets: c.rs,
			},
		}
		var expectedErr error = nil

		channels := &ResourceChannels{
			ReplicaSetList: ReplicaSetListChannel{
				List:  make(chan *extensions.ReplicaSetList, 1),
				Error: make(chan error, 1),
			},
			ReplicationControllerList: ReplicationControllerListChannel{
				List:  make(chan *api.ReplicationControllerList, 1),
				Error: make(chan error, 1),
			},
			NodeList: NodeListChannel{
				List:  make(chan *api.NodeList, 2),
				Error: make(chan error, 2),
			},
			ServiceList: ServiceListChannel{
				List:  make(chan *api.ServiceList, 2),
				Error: make(chan error, 2),
			},
			PodList: PodListChannel{
				List:  make(chan *api.PodList, 2),
				Error: make(chan error, 2),
			},
			EventList: EventListChannel{
				List:  make(chan *api.EventList, 2),
				Error: make(chan error, 2),
			},
		}

		channels.ReplicaSetList.Error <- nil
		channels.ReplicaSetList.List <- &c.k8sRs

		channels.ReplicationControllerList.List <- &c.k8sRc
		channels.ReplicationControllerList.Error <- nil

		nodeList := &api.NodeList{}
		channels.NodeList.List <- nodeList
		channels.NodeList.Error <- nil
		channels.NodeList.List <- nodeList
		channels.NodeList.Error <- nil

		serviceList := &api.ServiceList{}
		channels.ServiceList.List <- serviceList
		channels.ServiceList.Error <- nil
		channels.ServiceList.List <- serviceList
		channels.ServiceList.Error <- nil

		podList := &api.PodList{}
		channels.PodList.List <- podList
		channels.PodList.Error <- nil
		channels.PodList.List <- podList
		channels.PodList.Error <- nil

		eventList := &api.EventList{}
		channels.EventList.List <- eventList
		channels.EventList.Error <- nil
		channels.EventList.List <- eventList
		channels.EventList.Error <- nil

		actual, err := GetWorkloadsFromChannels(channels)
		if !reflect.DeepEqual(actual, expected) {
			t.Errorf("GetWorkloadsFromChannels() ==\n          %#v\nExpected: %#v", actual, expected)
		}
		if !reflect.DeepEqual(err, expectedErr) {
			t.Errorf("error from GetWorkloadsFromChannels() == %#v, expected %#v", actual, expected)
		}
	}
}
