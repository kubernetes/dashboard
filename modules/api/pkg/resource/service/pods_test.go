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

package service

import (
	"reflect"
	"testing"

	v1 "k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes/fake"

	metricapi "k8s.io/dashboard/api/pkg/integration/metric/api"
	"k8s.io/dashboard/api/pkg/resource/common"
	"k8s.io/dashboard/api/pkg/resource/dataselect"
	"k8s.io/dashboard/api/pkg/resource/pod"
	"k8s.io/dashboard/types"
)

func TestGetServicePods(t *testing.T) {
	cases := []struct {
		namespace, name string
		service         *v1.Service
		podList         *v1.PodList
		expected        *pod.PodList
	}{
		{
			"ns-1",
			"svc-1",
			&v1.Service{ObjectMeta: metaV1.ObjectMeta{
				Name: "svc-1", Namespace: "ns-1", Labels: map[string]string{"app": "test"},
			}, Spec: v1.ServiceSpec{Selector: map[string]string{}}},
			&v1.PodList{Items: []v1.Pod{
				{ObjectMeta: metaV1.ObjectMeta{
					Name:      "pod-1",
					Namespace: "ns-1",
					UID:       "test-uid",
				}},
			}},
			&pod.PodList{
				ListMeta:          types.ListMeta{TotalItems: 1},
				CumulativeMetrics: make([]metricapi.Metric, 0),
				Pods: []pod.Pod{
					{
						ObjectMeta: types.ObjectMeta{
							Name:      "pod-1",
							UID:       "test-uid",
							Namespace: "ns-1"},
						TypeMeta:          types.TypeMeta{Kind: types.ResourceKindPod},
						Warnings:          []common.Event{},
						ContainerStatuses: make([]pod.ContainerStatus, 0),
					},
				},
				Errors: []error{},
			},
		},
	}
	for _, c := range cases {
		fakeClient := fake.NewSimpleClientset(c.service, c.podList)

		actual, _ := GetServicePods(fakeClient, nil, c.namespace, c.name, dataselect.NoDataSelect)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetServicePods == \ngot %#v, \nexpected %#v", actual, c.expected)
		}

	}
}
