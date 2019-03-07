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

	"github.com/kubernetes/dashboard/src/app/backend/resource/endpoint"
	"github.com/kubernetes/dashboard/src/app/backend/resource/pod"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	v1 "k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes/fake"
)

func TestGetServiceList(t *testing.T) {
	cases := []struct {
		serviceList     *v1.ServiceList
		expectedActions []string
		expected        *ServiceList
	}{
		{
			serviceList: &v1.ServiceList{
				Items: []v1.Service{
					{ObjectMeta: metaV1.ObjectMeta{
						Name: "svc-1", Namespace: "ns-1",
						Labels: map[string]string{},
					}},
				}},
			expectedActions: []string{"list"},
			expected: &ServiceList{
				ListMeta: api.ListMeta{TotalItems: 1},
				Services: []Service{
					{
						ObjectMeta: api.ObjectMeta{
							Name:      "svc-1",
							Namespace: "ns-1",
							Labels:    map[string]string{},
						},
						TypeMeta:          api.TypeMeta{Kind: api.ResourceKindService},
						InternalEndpoint:  common.Endpoint{Host: "svc-1.ns-1"},
						ExternalEndpoints: []common.Endpoint{},
					},
				},
				Errors: []error{},
			},
		},
	}

	for _, c := range cases {
		fakeClient := fake.NewSimpleClientset(c.serviceList)
		actual, _ := GetServiceList(fakeClient, common.NewNamespaceQuery(nil), dataselect.NoDataSelect)
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
			t.Errorf("GetServiceList(client) == got\n%#v, expected\n %#v", actual, c.expected)
		}
	}
}

func TestToServiceDetail(t *testing.T) {
	cases := []struct {
		service      *v1.Service
		eventList    common.EventList
		podList      pod.PodList
		endpointList endpoint.EndpointList
		expected     ServiceDetail
	}{
		{
			service:      &v1.Service{},
			eventList:    common.EventList{},
			podList:      pod.PodList{},
			endpointList: endpoint.EndpointList{},
			expected: ServiceDetail{
				Service: Service{
					TypeMeta:          api.TypeMeta{Kind: api.ResourceKindService},
					ExternalEndpoints: []common.Endpoint{},
				},
			},
		}, {
			service: &v1.Service{
				ObjectMeta: metaV1.ObjectMeta{
					Name: "test-service", Namespace: "test-namespace",
				}},
			expected: ServiceDetail{
				Service: Service{
					ObjectMeta: api.ObjectMeta{
						Name:      "test-service",
						Namespace: "test-namespace",
					},
					TypeMeta:          api.TypeMeta{Kind: api.ResourceKindService},
					InternalEndpoint:  common.Endpoint{Host: "test-service.test-namespace"},
					ExternalEndpoints: []common.Endpoint{},
				},
			},
		},
	}

	for _, c := range cases {
		actual := toServiceDetail(c.service, c.endpointList, nil)

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("ToServiceDetail(%#v) == \ngot %#v, \nexpected %#v", c.service, actual,
				c.expected)
		}
	}
}

func TestToService(t *testing.T) {
	cases := []struct {
		service  *v1.Service
		expected Service
	}{
		{
			service: &v1.Service{}, expected: Service{
				TypeMeta:          api.TypeMeta{Kind: api.ResourceKindService},
				ExternalEndpoints: []common.Endpoint{},
			},
		}, {
			service: &v1.Service{
				ObjectMeta: metaV1.ObjectMeta{
					Name: "test-service", Namespace: "test-namespace",
				}},
			expected: Service{
				ObjectMeta: api.ObjectMeta{
					Name:      "test-service",
					Namespace: "test-namespace",
				},
				TypeMeta:          api.TypeMeta{Kind: api.ResourceKindService},
				InternalEndpoint:  common.Endpoint{Host: "test-service.test-namespace"},
				ExternalEndpoints: []common.Endpoint{},
			},
		},
	}

	for _, c := range cases {
		actual := toService(c.service)

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("ToService(%#v) == \ngot %#v, \nexpected %#v", c.service, actual,
				c.expected)
		}
	}
}
