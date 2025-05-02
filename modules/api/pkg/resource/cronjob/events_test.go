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

package cronjob_test

import (
	"reflect"
	"testing"

	v1 "k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes/fake"

	"k8s.io/dashboard/api/pkg/resource/common"
	"k8s.io/dashboard/api/pkg/resource/cronjob"
	"k8s.io/dashboard/api/pkg/resource/dataselect"
	"k8s.io/dashboard/types"
)

func TestGetJobEvents(t *testing.T) {
	cases := []struct {
		namespace, name string
		eventList       *v1.EventList
		expectedActions []string
		expected        *common.EventList
	}{
		{
			namespace,
			name,
			&v1.EventList{
				Items: []v1.Event{{
					Message: eventMessage,
					ObjectMeta: metaV1.ObjectMeta{
						Name:      name,
						Namespace: namespace,
						Labels:    labels,
					}},
				}},
			[]string{"list"},
			&common.EventList{
				ListMeta: types.ListMeta{
					TotalItems: 1,
				},
				Events: []common.Event{{
					TypeMeta: types.TypeMeta{
						Kind: types.ResourceKindEvent,
					},
					ObjectMeta: types.ObjectMeta{
						Name:      name,
						Namespace: namespace,
						Labels:    labels,
					},
					Message: eventMessage,
					Type:    v1.EventTypeNormal,
				}}},
		},
	}

	for _, c := range cases {
		fakeClient := fake.NewSimpleClientset(c.eventList)

		actual, _ := cronjob.GetCronJobEvents(fakeClient, dataselect.NoDataSelect, c.namespace, c.name)

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
			t.Errorf("TestGetJobEvents(client,metricClient,%#v, %#v) == \ngot: %#v, \nexpected %#v",
				c.namespace, c.name, actual, c.expected)
		}
	}
}
