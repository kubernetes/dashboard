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

package common

import (
	"reflect"
	"testing"

	api "k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func TestFilterNamespacedServicesBySelector(t *testing.T) {
	firstLabelSelectorMap := make(map[string]string)
	firstLabelSelectorMap["name"] = "app-name-first"
	secondLabelSelectorMap := make(map[string]string)
	secondLabelSelectorMap["name"] = "app-name-second"

	cases := []struct {
		selector  map[string]string
		namespace string
		services  []api.Service
		expected  []api.Service
	}{
		{
			firstLabelSelectorMap, "test-ns-1",
			[]api.Service{
				{
					ObjectMeta: metaV1.ObjectMeta{
						Name:      "first-service-ok",
						Namespace: "test-ns-1",
					},
					Spec: api.ServiceSpec{
						Selector: firstLabelSelectorMap,
					},
				},
				{
					ObjectMeta: metaV1.ObjectMeta{
						Name:      "second-service-wrong",
						Namespace: "test-ns-2",
					},
					Spec: api.ServiceSpec{
						Selector: firstLabelSelectorMap,
					},
				},
				{
					ObjectMeta: metaV1.ObjectMeta{
						Name:      "third-service-wrong",
						Namespace: "test-ns-1",
					},
					Spec: api.ServiceSpec{
						Selector: secondLabelSelectorMap,
					},
				},
			},
			[]api.Service{
				{
					ObjectMeta: metaV1.ObjectMeta{
						Name:      "first-service-ok",
						Namespace: "test-ns-1",
					},
					Spec: api.ServiceSpec{
						Selector: firstLabelSelectorMap,
					},
				},
			},
		},
	}

	for _, c := range cases {
		actual := FilterNamespacedServicesBySelector(c.services, c.namespace, c.selector)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("FilterNamespacedServicesBySelector(%+v, %+v) == \n%+v, expected \n%+v",
				c.services, c.selector, actual, c.expected)
		}
	}
}
