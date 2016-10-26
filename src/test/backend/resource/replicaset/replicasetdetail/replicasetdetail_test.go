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

package replicasetdetail

import (
	"reflect"
	"testing"

	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/api/unversioned"
	"k8s.io/kubernetes/pkg/apis/extensions"
	"k8s.io/kubernetes/pkg/client/restclient"
	k8sClient "k8s.io/kubernetes/pkg/client/unversioned"
	"k8s.io/kubernetes/pkg/client/unversioned/testclient"

	"github.com/kubernetes/dashboard/src/app/backend/client"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/metric"
	"github.com/kubernetes/dashboard/src/app/backend/resource/pod"
	"github.com/kubernetes/dashboard/src/app/backend/resource/service"
)

type FakeHeapsterClient struct {
	client k8sClient.Interface
}

func (c FakeHeapsterClient) Get(path string) client.RequestInterface {
	return &restclient.Request{}
}

func TestGetReplicaSetDetail(t *testing.T) {
	eventList := &api.EventList{}
	podList := &api.PodList{}
	serviceList := &api.ServiceList{}

	cases := []struct {
		namespace, name string
		expectedActions []string
		replicaSet      *extensions.ReplicaSet
		expected        *ReplicaSetDetail
	}{
		{
			"test-namespace", "test-name",
			[]string{"get", "list", "get", "list", "list", "get", "list", "list", "get", "list"},
			&extensions.ReplicaSet{
				ObjectMeta: api.ObjectMeta{Name: "test-replicaset"},
				Spec: extensions.ReplicaSetSpec{
					Selector: &unversioned.LabelSelector{
						MatchLabels: map[string]string{},
					}},
			},
			&ReplicaSetDetail{
				ObjectMeta: common.ObjectMeta{Name: "test-replicaset"},
				TypeMeta:   common.TypeMeta{Kind: common.ResourceKindReplicaSet},
				PodInfo:    common.PodInfo{Warnings: []common.Event{}},
				PodList: pod.PodList{
					Pods:              []pod.Pod{},
					CumulativeMetrics: make([]metric.Metric, 0),
				},
				Selector: &unversioned.LabelSelector{
					MatchLabels: map[string]string{},
				},
				ServiceList: service.ServiceList{Services: []service.Service{}},
				EventList:   common.EventList{Events: []common.Event{}},
			},
		},
	}

	for _, c := range cases {
		fakeClient := testclient.NewSimpleFake(c.replicaSet, podList, serviceList, eventList, c.replicaSet,
			podList, serviceList, eventList)
		fakeHeapsterClient := FakeHeapsterClient{client: testclient.NewSimpleFake()}

		dataselect.DefaultDataSelectWithMetrics.MetricQuery = dataselect.NoMetrics
		actual, _ := GetReplicaSetDetail(fakeClient, fakeHeapsterClient, c.namespace, c.name)

		actions := fakeClient.Actions()
		if len(actions) != len(c.expectedActions) {
			t.Errorf("Unexpected actions: %v, expected %d actions got %d", actions,
				len(c.expectedActions), len(actions))
			continue
		}

		for i, verb := range c.expectedActions {
			if actions[i].GetVerb() != verb {
				t.Errorf("Unexpected action: %+v, expected %s",
					actions[i], verb)
			}
		}

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetEvents(client,heapsterClient,%#v, %#v) == \ngot: %#v, \nexpected %#v",
				c.namespace, c.name, actual, c.expected)
		}
	}
}

func TestToReplicaSetDetail(t *testing.T) {
	cases := []struct {
		replicaSet  *extensions.ReplicaSet
		eventList   common.EventList
		podList     pod.PodList
		podInfo     common.PodInfo
		serviceList service.ServiceList
		expected    ReplicaSetDetail
	}{
		{
			&extensions.ReplicaSet{},
			common.EventList{},
			pod.PodList{},
			common.PodInfo{},
			service.ServiceList{},
			ReplicaSetDetail{TypeMeta: common.TypeMeta{Kind: common.ResourceKindReplicaSet}},
		}, {
			&extensions.ReplicaSet{ObjectMeta: api.ObjectMeta{Name: "replica-set"}},
			common.EventList{Events: []common.Event{{Message: "event-msg"}}},
			pod.PodList{Pods: []pod.Pod{{ObjectMeta: common.ObjectMeta{Name: "pod-1"}}}},
			common.PodInfo{},
			service.ServiceList{Services: []service.Service{{ObjectMeta: common.ObjectMeta{Name: "service-1"}}}},
			ReplicaSetDetail{
				ObjectMeta: common.ObjectMeta{Name: "replica-set"},
				TypeMeta:   common.TypeMeta{Kind: common.ResourceKindReplicaSet},
				EventList:  common.EventList{Events: []common.Event{{Message: "event-msg"}}},
				PodList: pod.PodList{
					Pods: []pod.Pod{{
						ObjectMeta: common.ObjectMeta{Name: "pod-1"},
					}},
				},
				ServiceList: service.ServiceList{
					Services: []service.Service{{
						ObjectMeta: common.ObjectMeta{Name: "service-1"},
					}},
				},
			},
		},
	}

	for _, c := range cases {
		actual := ToReplicaSetDetail(c.replicaSet, c.eventList, c.podList, c.podInfo, c.serviceList)

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("ToReplicaSetDetail(%#v, %#v, %#v, %#v) == \ngot %#v, \nexpected %#v",
				c.replicaSet, c.eventList, c.podList, c.podInfo, c.serviceList, actual, c.expected)
		}
	}
}
