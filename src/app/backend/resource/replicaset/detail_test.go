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

package replicaset

import (
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/horizontalpodautoscaler"
	"github.com/kubernetes/dashboard/src/app/backend/resource/pod"
	"github.com/kubernetes/dashboard/src/app/backend/resource/service"
	apps "k8s.io/api/apps/v1beta2"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes/fake"
)

func TestGetReplicaSetDetail(t *testing.T) {
	replicas := int32(0)
	cases := []struct {
		namespace, name string
		expectedActions []string
		replicaSet      *apps.ReplicaSet
		expected        *ReplicaSetDetail
	}{
		{
			"ns-1", "rs-1",
			[]string{"get", "list", "get", "list", "list", "list", "get", "list", "list"},
			&apps.ReplicaSet{
				ObjectMeta: metaV1.ObjectMeta{Name: "rs-1", Namespace: "ns-1",
					Labels: map[string]string{"app": "test"}},
				Spec: apps.ReplicaSetSpec{
					Replicas: &replicas,
					Selector: &metaV1.LabelSelector{
						MatchLabels: map[string]string{"app": "test"},
					},
				},
			},
			&ReplicaSetDetail{
				ObjectMeta: api.ObjectMeta{Name: "rs-1", Namespace: "ns-1",
					Labels: map[string]string{"app": "test"}},
				TypeMeta: api.TypeMeta{Kind: api.ResourceKindReplicaSet},
				PodInfo: common.PodInfo{
					Warnings: []common.Event{},
					Desired:  &replicas,
				},
				PodList: pod.PodList{
					Pods:              []pod.Pod{},
					CumulativeMetrics: make([]metricapi.Metric, 0),
					Errors:            []error{},
				},
				Selector: &metaV1.LabelSelector{
					MatchLabels: map[string]string{"app": "test"},
				},
				ServiceList: service.ServiceList{
					Services: []service.Service{},
					Errors:   []error{},
				},
				EventList: common.EventList{Events: []common.Event{}},
				HorizontalPodAutoscalerList: horizontalpodautoscaler.HorizontalPodAutoscalerList{
					HorizontalPodAutoscalers: []horizontalpodautoscaler.HorizontalPodAutoscaler{},
					Errors: []error{},
				},
				Errors: []error{},
			},
		},
	}

	for _, c := range cases {
		fakeClient := fake.NewSimpleClientset(c.replicaSet)

		dataselect.DefaultDataSelectWithMetrics.MetricQuery = dataselect.NoMetrics
		actual, _ := GetReplicaSetDetail(fakeClient, nil, c.namespace, c.name)

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
		replicaSet  *apps.ReplicaSet
		eventList   common.EventList
		podList     pod.PodList
		podInfo     common.PodInfo
		serviceList service.ServiceList
		hpaList     horizontalpodautoscaler.HorizontalPodAutoscalerList
		expected    ReplicaSetDetail
	}{
		{
			&apps.ReplicaSet{},
			common.EventList{},
			pod.PodList{},
			common.PodInfo{},
			service.ServiceList{},
			horizontalpodautoscaler.HorizontalPodAutoscalerList{},
			ReplicaSetDetail{
				TypeMeta: api.TypeMeta{Kind: api.ResourceKindReplicaSet},
				Errors:   []error{},
			},
		}, {
			&apps.ReplicaSet{ObjectMeta: metaV1.ObjectMeta{Name: "replica-set"}},
			common.EventList{Events: []common.Event{{Message: "event-msg"}}},
			pod.PodList{Pods: []pod.Pod{{ObjectMeta: api.ObjectMeta{Name: "pod-1"}}}},
			common.PodInfo{},
			service.ServiceList{Services: []service.Service{{ObjectMeta: api.ObjectMeta{Name: "service-1"}}}},
			horizontalpodautoscaler.HorizontalPodAutoscalerList{
				HorizontalPodAutoscalers: []horizontalpodautoscaler.HorizontalPodAutoscaler{{
					ObjectMeta: api.ObjectMeta{Name: "hpa-1"},
				}},
			},
			ReplicaSetDetail{
				ObjectMeta: api.ObjectMeta{Name: "replica-set"},
				TypeMeta:   api.TypeMeta{Kind: api.ResourceKindReplicaSet},
				EventList:  common.EventList{Events: []common.Event{{Message: "event-msg"}}},
				PodList: pod.PodList{
					Pods: []pod.Pod{{
						ObjectMeta: api.ObjectMeta{Name: "pod-1"},
					}},
				},
				ServiceList: service.ServiceList{
					Services: []service.Service{{
						ObjectMeta: api.ObjectMeta{Name: "service-1"},
					}},
				},
				HorizontalPodAutoscalerList: horizontalpodautoscaler.HorizontalPodAutoscalerList{
					HorizontalPodAutoscalers: []horizontalpodautoscaler.HorizontalPodAutoscaler{{
						ObjectMeta: api.ObjectMeta{Name: "hpa-1"},
					}},
				},
				Errors: []error{},
			},
		},
	}

	for _, c := range cases {
		actual := toReplicaSetDetail(c.replicaSet, c.eventList, c.podList, c.podInfo, c.serviceList, c.hpaList, []error{})

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("toReplicaSetDetail(%#v, %#v, %#v, %#v, %#v) == \ngot %#v, \nexpected %#v",
				c.replicaSet, c.eventList, c.podList, c.podInfo, c.serviceList, actual, c.expected)
		}
	}
}
