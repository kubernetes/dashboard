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

package service

import (
	"reflect"
	"testing"

	"k8s.io/kubernetes/pkg/api"
	k8sClient "k8s.io/kubernetes/pkg/client/unversioned"
	"k8s.io/kubernetes/pkg/client/unversioned/testclient"

	"github.com/kubernetes/dashboard/src/app/backend/client"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/pod"
)

type FakeHeapsterClient struct {
	client k8sClient.Interface
}

type FakeRequest struct{}

func (FakeRequest) DoRaw() ([]byte, error) {
	return nil, nil
}

func (c FakeHeapsterClient) Get(path string) client.RequestInterface {
	return FakeRequest{}
}

func TestGetServiceDetail(t *testing.T) {
	cases := []struct {
		service         *api.Service
		namespace, name string
		expectedActions []string
		expected        *ServiceDetail
	}{
		{
			service:   &api.Service{},
			namespace: "test-namespace-1", name: "test-name",
			expectedActions: []string{"get", "list"},
			expected: &ServiceDetail{
				TypeMeta: common.TypeMeta{Kind: common.ResourceKindService},
				PodList:  pod.PodList{Pods: []pod.Pod{}},
			},
		}, {
			service: &api.Service{ObjectMeta: api.ObjectMeta{
				Name: "test-service", Namespace: "test-namespace",
			}},
			namespace: "test-namespace-2", name: "test-name",
			expectedActions: []string{"get", "list"},
			expected: &ServiceDetail{
				ObjectMeta: common.ObjectMeta{
					Name:      "test-service",
					Namespace: "test-namespace",
				},
				TypeMeta:         common.TypeMeta{Kind: common.ResourceKindService},
				InternalEndpoint: common.Endpoint{Host: "test-service.test-namespace"},
				PodList:          pod.PodList{Pods: []pod.Pod{}},
			},
		},
	}

	for _, c := range cases {
		fakeClient := testclient.NewSimpleFake(c.service)
		fakeHeapsterClient := FakeHeapsterClient{client: testclient.NewSimpleFake()}

		actual, _ := GetServiceDetail(fakeClient, fakeHeapsterClient, c.namespace, c.name)

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
			t.Errorf("GetServiceDetail(client, %#v, %#v) == \ngot %#v, \nexpected %#v", c.namespace,
				c.name, actual, c.expected)
		}
	}
}

func TestGetServicePods(t *testing.T) {
	firstSelector := map[string]string{"app": "selector-1"}
	secondSelector := map[string]string{"app": "selector-2"}
	cases := []struct {
		namespace       string
		serviceSelector map[string]string
		podList         *api.PodList
		expectedActions []string
		expected        *pod.PodList
	}{
		{
			"test-namespace-1", firstSelector,
			&api.PodList{Items: []api.Pod{}}, []string{"list"}, &pod.PodList{Pods: []pod.Pod{}},
		}, {
			"test-namespace-2",
			firstSelector,
			&api.PodList{Items: []api.Pod{{ObjectMeta: api.ObjectMeta{
				Name:   "test-pod",
				Labels: secondSelector,
			}}}},
			[]string{"list"},
			&pod.PodList{Pods: []pod.Pod{}},
		}, {
			"test-namespace-3",
			firstSelector,
			&api.PodList{Items: []api.Pod{{ObjectMeta: api.ObjectMeta{
				Name:      "test-pod",
				Labels:    firstSelector,
				Namespace: "test-namespace-3",
			}}}},
			[]string{"list"},
			&pod.PodList{Pods: []pod.Pod{{
				ObjectMeta: common.ObjectMeta{
					Name:      "test-pod",
					Labels:    firstSelector,
					Namespace: "test-namespace-3",
				},
				TypeMeta: common.TypeMeta{Kind: common.ResourceKindPod},
			}}},
		},
	}

	for _, c := range cases {
		fakeClient := testclient.NewSimpleFake(c.podList)
		fakeHeapsterClient := FakeHeapsterClient{client: testclient.NewSimpleFake()}

		actual, _ := GetServicePods(fakeClient, fakeHeapsterClient, c.namespace, c.serviceSelector)

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
			t.Errorf("GetServicePods(client, heapsterClient, %#v, %#v) == \ngot %#v, \nexpected %#v",
				c.namespace, c.serviceSelector, actual, c.expected)
		}
	}
}
