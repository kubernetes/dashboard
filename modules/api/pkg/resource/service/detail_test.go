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

	"k8s.io/dashboard/api/pkg/resource/common"
	"k8s.io/dashboard/api/pkg/resource/endpoint"
	"k8s.io/dashboard/types"
)

func TestGetServiceDetail(t *testing.T) {
	cases := []struct {
		service         *v1.Service
		namespace, name string
		expectedActions []string
		expected        *ServiceDetail
	}{
		{
			service: &v1.Service{ObjectMeta: metaV1.ObjectMeta{
				Name: "svc-1", Namespace: "ns-1", Labels: map[string]string{},
			}},
			namespace: "ns-1", name: "svc-1",
			expectedActions: []string{"get", "list"},
			expected: &ServiceDetail{
				Service: Service{
					ObjectMeta: types.ObjectMeta{
						Name:      "svc-1",
						Namespace: "ns-1",
						Labels:    map[string]string{},
					},
					TypeMeta:          types.TypeMeta{Kind: types.ResourceKindService},
					InternalEndpoint:  common.Endpoint{Host: "svc-1.ns-1"},
					ExternalEndpoints: []common.Endpoint{},
				},
				EndpointList: endpoint.EndpointList{
					Endpoints: []endpoint.Endpoint{},
				},
				Errors: []error{},
			},
		},
		{
			service: &v1.Service{
				ObjectMeta: metaV1.ObjectMeta{
					Name:      "svc-2",
					Namespace: "ns-2",
				},
				Spec: v1.ServiceSpec{
					Selector: map[string]string{"app": "app2"},
				},
			},
			namespace: "ns-2", name: "svc-2",
			expectedActions: []string{"get", "list"},
			expected: &ServiceDetail{
				Service: Service{
					ObjectMeta: types.ObjectMeta{
						Name:      "svc-2",
						Namespace: "ns-2",
					},
					Selector:          map[string]string{"app": "app2"},
					TypeMeta:          types.TypeMeta{Kind: types.ResourceKindService},
					InternalEndpoint:  common.Endpoint{Host: "svc-2.ns-2"},
					ExternalEndpoints: []common.Endpoint{},
				},

				EndpointList: endpoint.EndpointList{
					Endpoints: []endpoint.Endpoint{},
				},
				Errors: []error{},
			},
		},
	}

	for _, c := range cases {
		fakeClient := fake.NewSimpleClientset(c.service)
		actual, _ := GetServiceDetail(fakeClient, c.namespace, c.name)
		actions := fakeClient.Actions()

		if len(actions) != len(c.expectedActions) {
			t.Errorf("Unexpected actions: %v, expected %d actions got %d", actions,
				len(c.expectedActions), len(actions))
			continue
		}

		for i, verb := range c.expectedActions {
			if actions[i].GetVerb() != verb {
				t.Errorf("Unexpected action: %+v, expected %s", actions[i], verb)
			}
		}

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetServiceDetail(client, %#v, %#v) == \ngot %#v, \nexpected %#v", c.namespace,
				c.name, actual, c.expected)
		}
	}
}
