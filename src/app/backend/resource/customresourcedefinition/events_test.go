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

package customresourcedefinition

import (
	"reflect"
	"testing"

	coreV1 "k8s.io/api/core/v1"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"

	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/client-go/kubernetes/fake"
)

func TestGetEventsForCustomResourceObject(t *testing.T) {
	cases := []struct {
		namespace, objectName string
		eventList             *coreV1.EventList
		objectList            *unstructured.UnstructuredList
		expected              *common.EventList
	}{
		{
			"ns-1", "example-foo",
			&coreV1.EventList{Items: []coreV1.Event{
				{
					Message: "test-message",
					ObjectMeta: metaV1.ObjectMeta{
						Name: "ev-1", Namespace: "ns-1",
						Labels: map[string]string{"app": "test"},
					},
					InvolvedObject: coreV1.ObjectReference{UID: "test-uid"}},
			}},
			&unstructured.UnstructuredList{Items: []unstructured.Unstructured{
				{
					Object: map[string]interface{}{
						"apiVersion": "samplecontroller.k8s.io/v1alpha1",
						"kind":       "Foo",
						"metadata": map[string]interface{}{
							"name":      "example-foo",
							"namespace": "ns-1",
							"uid":       "test-uid",
						},
					},
				},
			}},
			&common.EventList{
				ListMeta: api.ListMeta{TotalItems: 1},
				Events: []common.Event{{
					TypeMeta: api.TypeMeta{Kind: api.ResourceKindEvent},
					ObjectMeta: api.ObjectMeta{Name: "ev-1", Namespace: "ns-1",
						Labels: map[string]string{"app": "test"}},
					Message: "test-message",
					Type:    coreV1.EventTypeNormal,
				}},
				Errors: []error{},
			},
		},
	}

	for _, c := range cases {
		fakeClient := fake.NewSimpleClientset(c.eventList, c.objectList)

		actual, _ := GetEventsForCustomResourceObject(fakeClient, dataselect.NoDataSelect, c.namespace, c.objectName)

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetEventsForCustomResourceObject == \ngot %#v, \nexpected %#v", actual,
				c.expected)
		}
	}
}
