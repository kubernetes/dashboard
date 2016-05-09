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

	"github.com/kubernetes/dashboard/resource/common"
	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/client/unversioned/testclient"
)

func TestGetService(t *testing.T) {
	cases := []struct {
		service         *api.Service
		namespace, name string
		expectedActions []string
		expected        *Service
	}{
		{
			service:   &api.Service{},
			namespace: "test-namespace", name: "test-name",
			expectedActions: []string{"get"},
			expected:        &Service{},
		}, {
			service: &api.Service{ObjectMeta: api.ObjectMeta{
				Name: "test-service", Namespace: "test-namespace",
			}},
			namespace: "test-namespace", name: "test-name",
			expectedActions: []string{"get"},
			expected: &Service{
				ObjectMeta: common.ObjectMeta{
					Name:      "test-service",
					Namespace: "test-namespace",
				},
				InternalEndpoint: common.Endpoint{Host: "test-service.test-namespace"},
			},
		},
	}

	for _, c := range cases {
		fakeClient := testclient.NewSimpleFake(c.service)

		actual, _ := GetService(fakeClient, c.namespace, c.name)

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
			t.Errorf("GetService(client, %#v, %#v) == \ngot %#v, \nexpected %#v", c.namespace,
				c.name, actual, c.expected)
		}
	}
}

func TestGetServiceList(t *testing.T) {
	cases := []struct {
		serviceList     *api.ServiceList
		expectedActions []string
		expected        *ServiceList
	}{
		{
			serviceList:     &api.ServiceList{},
			expectedActions: []string{"list"},
			expected:        &ServiceList{Services: make([]Service, 0)},
		}, {
			serviceList: &api.ServiceList{
				Items: []api.Service{
					{ObjectMeta: api.ObjectMeta{
						Name: "test-service", Namespace: "test-namespace",
					}},
				}},
			expectedActions: []string{"list"},
			expected: &ServiceList{
				Services: []Service{
					{
						ObjectMeta: common.ObjectMeta{
							Name:      "test-service",
							Namespace: "test-namespace",
						},
						InternalEndpoint: common.Endpoint{Host: "test-service.test-namespace"},
					},
				},
			},
		},
	}

	for _, c := range cases {
		fakeClient := testclient.NewSimpleFake(c.serviceList)

		actual, _ := GetServiceList(fakeClient)

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
			t.Errorf("GetServiceList(client) == \ngot %#v, \nexpected %#v", actual, c.expected)
		}
	}
}

func TestGetServices(t *testing.T) {
	cases := []struct {
		service  *api.Service
		expected Service
	}{
		{
			service: &api.Service{}, expected: Service{},
		}, {
			service: &api.Service{
				ObjectMeta: api.ObjectMeta{
					Name: "test-service", Namespace: "test-namespace",
				}},
			expected: Service{
				ObjectMeta: common.ObjectMeta{
					Name:      "test-service",
					Namespace: "test-namespace",
				},
				InternalEndpoint: common.Endpoint{Host: "test-service.test-namespace"},
			},
		},
	}

	for _, c := range cases {
		actual := GetServiceDetails(c.service)

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getServices(%#v) == \ngot %#v, \nexpected %#v", c.service, actual,
				c.expected)
		}
	}
}
