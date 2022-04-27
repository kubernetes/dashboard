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

package limitrange

import (
	"reflect"
	"testing"

	api "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/resource"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func TestGetLimitResourceDetail(t *testing.T) {
	testMemory := "6G"
	testMemoryQuantity, _ := resource.ParseQuantity(testMemory)
	cases := []struct {
		limitRanges *api.LimitRange
		expected    []LimitRangeItem
	}{
		{
			&api.LimitRange{
				ObjectMeta: metaV1.ObjectMeta{Name: "foo"},
				Spec: api.LimitRangeSpec{
					Limits: []api.LimitRangeItem{
						{
							Type: api.LimitTypePod,
							Max: map[api.ResourceName]resource.Quantity{
								api.ResourceMemory: testMemoryQuantity,
							},
							Min: map[api.ResourceName]resource.Quantity{
								api.ResourceMemory: testMemoryQuantity,
							},
							Default: map[api.ResourceName]resource.Quantity{
								api.ResourceMemory: testMemoryQuantity,
							},
							DefaultRequest: map[api.ResourceName]resource.Quantity{
								api.ResourceMemory: testMemoryQuantity,
							},
							MaxLimitRequestRatio: map[api.ResourceName]resource.Quantity{
								api.ResourceMemory: testMemoryQuantity,
							},
						},
					},
				},
			},
			[]LimitRangeItem{
				{
					ResourceType:         string(api.LimitTypePod),
					ResourceName:         string(api.ResourceMemory),
					Max:                  testMemory,
					Min:                  testMemory,
					Default:              testMemory,
					DefaultRequest:       testMemory,
					MaxLimitRequestRatio: testMemory,
				},
			},
		},
	}

	for _, c := range cases {
		actual := ToLimitRanges(c.limitRanges)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getLimitRangeDetail(%#v) == \n%#v\nexpected \n%#v\n",
				c.limitRanges, actual, c.expected)
		}
	}
}
