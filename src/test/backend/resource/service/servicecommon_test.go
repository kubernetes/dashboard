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

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
)

func TestToServiceDetail(t *testing.T) {
	cases := []struct {
		service  *api.Service
		expected ServiceDetail
	}{
		{
			service: &api.Service{}, expected: ServiceDetail{
				TypeMeta: common.TypeMeta{Kind: common.ResourceKindService},
			},
		}, {
			service: &api.Service{
				ObjectMeta: api.ObjectMeta{
					Name: "test-service", Namespace: "test-namespace",
				}},
			expected: ServiceDetail{
				ObjectMeta: common.ObjectMeta{
					Name:      "test-service",
					Namespace: "test-namespace",
				},
				TypeMeta:         common.TypeMeta{Kind: common.ResourceKindService},
				InternalEndpoint: common.Endpoint{Host: "test-service.test-namespace"},
			},
		},
	}

	for _, c := range cases {
		actual := ToServiceDetail(c.service)

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("ToServiceDetail(%#v) == \ngot %#v, \nexpected %#v", c.service, actual,
				c.expected)
		}
	}
}

func TestToService(t *testing.T) {
	cases := []struct {
		service  *api.Service
		expected Service
	}{
		{
			service: &api.Service{}, expected: Service{
				TypeMeta: common.TypeMeta{Kind: common.ResourceKindService},
			},
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
				TypeMeta:         common.TypeMeta{Kind: common.ResourceKindService},
				InternalEndpoint: common.Endpoint{Host: "test-service.test-namespace"},
			},
		},
	}

	for _, c := range cases {
		actual := ToService(c.service)

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("ToService(%#v) == \ngot %#v, \nexpected %#v", c.service, actual,
				c.expected)
		}
	}
}
