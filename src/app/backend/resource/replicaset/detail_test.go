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

package replicaset

import (
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/client"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/horizontalpodautoscaler"
	"github.com/kubernetes/dashboard/src/app/backend/resource/metric"
	"github.com/kubernetes/dashboard/src/app/backend/resource/pod"
	"github.com/kubernetes/dashboard/src/app/backend/resource/service"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes/fake"
	extensions "k8s.io/client-go/pkg/apis/extensions/v1beta1"
	restclient "k8s.io/client-go/rest"
)

type FakeHeapsterClient struct {
	client fake.Clientset
}

func (c FakeHeapsterClient) Get(path string) client.RequestInterface {
	return &restclient.Request{}
}

func TestGetReplicaSetDetail(t *testing.T) {
	replicas := int32(0)
	cases := []struct {
		namespace, name string
		expectedActions []string
		replicaSet      *extensions.ReplicaSet
		expected        *ReplicaSetDetail
	}{
		{
			"ns-1", "rs-1",
			[]string{"get", "list", "get", "list", "list", "get", "list", "list", "get", "list", "list"},
			&extensions.ReplicaSet{
				ObjectMeta: metaV1.ObjectMeta{Name: "rs-1", Namespace: "ns-1",
					Labels: map[string]string{"app": "test"}},
				Spec: extensions.ReplicaSetSpec{
					Replicas: &replicas,
					Selector: &metaV1.LabelSelector{
						MatchLabels: map[string]string{"app": "test"},
					},
				},
			},
			&ReplicaSetDetail{
				ObjectMeta: common.ObjectMeta{Name: "rs-1", Namespace: "ns-1",
					Labels: map[string]string{"app": "test"}},
				TypeMeta: common.TypeMeta{Kind: common.ResourceKindReplicaSet},
				PodInfo:  common.PodInfo{Warnings: []common.Event{}},
				PodList: pod.PodList{
					Pods:              []pod.Pod{},
					CumulativeMetrics: make([]metric.Metric, 0),
				},
				Selector: &metaV1.LabelSelector{
					MatchLabels: map[string]string{"app": "test"},
				},
				ServiceList:                 service.ServiceList{Services: []service.Service{}},
				EventList:                   common.EventList{Events: []common.Event{}},
				HorizontalPodAutoscalerList: horizontalpodautoscaler.HorizontalPodAutoscalerList{HorizontalPodAutoscalers: []horizontalpodautoscaler.HorizontalPodAutoscaler{}},
			},
		},
	}

	for _, c := range cases {
		fakeClient := fake.NewSimpleClientset(c.replicaSet)
		fakeHeapsterClient := FakeHeapsterClient{client: *fake.NewSimpleClientset()}

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
		hpaList     horizontalpodautoscaler.HorizontalPodAutoscalerList
		expected    ReplicaSetDetail
	}{
		{
			&extensions.ReplicaSet{},
			common.EventList{},
			pod.PodList{},
			common.PodInfo{},
			service.ServiceList{},
			horizontalpodautoscaler.HorizontalPodAutoscalerList{},
			ReplicaSetDetail{TypeMeta: common.TypeMeta{Kind: common.ResourceKindReplicaSet}},
		}, {
			&extensions.ReplicaSet{ObjectMeta: metaV1.ObjectMeta{Name: "replica-set"}},
			common.EventList{Events: []common.Event{{Message: "event-msg"}}},
			pod.PodList{Pods: []pod.Pod{{ObjectMeta: common.ObjectMeta{Name: "pod-1"}}}},
			common.PodInfo{},
			service.ServiceList{Services: []service.Service{{ObjectMeta: common.ObjectMeta{Name: "service-1"}}}},
			horizontalpodautoscaler.HorizontalPodAutoscalerList{
				HorizontalPodAutoscalers: []horizontalpodautoscaler.HorizontalPodAutoscaler{{
					ObjectMeta: common.ObjectMeta{Name: "hpa-1"},
				}},
			},
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
				HorizontalPodAutoscalerList: horizontalpodautoscaler.HorizontalPodAutoscalerList{
					HorizontalPodAutoscalers: []horizontalpodautoscaler.HorizontalPodAutoscaler{{
						ObjectMeta: common.ObjectMeta{Name: "hpa-1"},
					}},
				},
			},
		},
	}

	for _, c := range cases {
		actual := ToReplicaSetDetail(c.replicaSet, c.eventList, c.podList, c.podInfo, c.serviceList, c.hpaList)

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("ToReplicaSetDetail(%#v, %#v, %#v, %#v, %#v) == \ngot %#v, \nexpected %#v",
				c.replicaSet, c.eventList, c.podList, c.podInfo, c.serviceList, actual, c.expected)
		}
	}
}
