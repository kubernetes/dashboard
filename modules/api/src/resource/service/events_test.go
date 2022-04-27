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

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	v1 "k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes/fake"
)

func TestServiceEvents(t *testing.T) {
	cases := []struct {
		service         *v1.Service
		namespace, name string
		eventList       *v1.EventList
		expectedActions []string
		expected        *common.EventList
	}{
		{
			service: &v1.Service{ObjectMeta: metaV1.ObjectMeta{
				Name: "svc-1", Namespace: "ns-1", Labels: map[string]string{"app": "test"},
			}},
			namespace: "ns-1", name: "svc-1",
			eventList: &v1.EventList{Items: []v1.Event{
				{Message: "test-message", ObjectMeta: metaV1.ObjectMeta{
					Name: "ev-1", Namespace: "ns-1", Labels: map[string]string{"app": "test"},
				}},
			}},
			expectedActions: []string{"list"},
			expected: &common.EventList{
				ListMeta: api.ListMeta{TotalItems: 1},
				Events: []common.Event{{
					TypeMeta: api.TypeMeta{Kind: api.ResourceKindEvent},
					ObjectMeta: api.ObjectMeta{Name: "ev-1", Namespace: "ns-1",
						Labels: map[string]string{"app": "test"}},
					Message: "test-message",
					Type:    v1.EventTypeNormal,
				}}},
		},
	}

	for _, c := range cases {

		fakeClient := fake.NewSimpleClientset(c.eventList, c.service)

		actual, _ := GetServiceEvents(fakeClient, dataselect.NoDataSelect, c.namespace, c.name)

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetServiceEvents(client,%#v, %#v) == \ngot: %#v, \nexpected %#v",
				c.namespace, c.name, actual, c.expected)
		}
	}
}
