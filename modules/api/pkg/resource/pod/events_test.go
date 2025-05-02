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

package pod

import (
	"reflect"
	"testing"

	v1 "k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes/fake"

	"k8s.io/dashboard/api/pkg/resource/common"
	"k8s.io/dashboard/api/pkg/resource/dataselect"
	"k8s.io/dashboard/types"
)

func TestGetPodEvents(t *testing.T) {
	cases := []struct {
		namespace, podName string
		eventList          *v1.EventList
		podList            *v1.PodList
		expected           *common.EventList
	}{
		{
			"ns-1", "pod-1",
			&v1.EventList{Items: []v1.Event{
				{
					Message: "test-message",
					ObjectMeta: metaV1.ObjectMeta{
						Name: "ev-1", Namespace: "ns-1",
						Labels: map[string]string{"app": "test"},
					},
					InvolvedObject: v1.ObjectReference{UID: "test-uid"}},
			}},
			&v1.PodList{Items: []v1.Pod{
				{ObjectMeta: metaV1.ObjectMeta{
					Name:      "pod-1",
					Namespace: "ns-1",
					UID:       "test-uid",
				}},
			}},
			&common.EventList{
				ListMeta: types.ListMeta{TotalItems: 1},
				Events: []common.Event{{
					TypeMeta: types.TypeMeta{Kind: types.ResourceKindEvent},
					ObjectMeta: types.ObjectMeta{Name: "ev-1", Namespace: "ns-1",
						Labels: map[string]string{"app": "test"}},
					Message: "test-message",
					Type:    v1.EventTypeNormal,
				}},
				Errors: []error{},
			},
		},
	}

	for _, c := range cases {
		fakeClient := fake.NewSimpleClientset(c.podList, c.eventList)

		actual, _ := GetEventsForPod(fakeClient, dataselect.NoDataSelect, c.namespace, c.podName)

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetEventsForPods == \ngot %#v, \nexpected %#v", actual,
				c.expected)
		}
	}
}
