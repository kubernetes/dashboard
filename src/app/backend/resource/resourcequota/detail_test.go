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

package resourcequota

import (
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"k8s.io/apimachinery/pkg/api/resource"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	api "k8s.io/client-go/pkg/api/v1"
)

func TestGetResourceQuotaDetail(t *testing.T) {

	testMemoryQuantity, _ := resource.ParseQuantity("6G")

	cases := []struct {
		resourceQuotas *api.ResourceQuota
		expected       *ResourceQuotaDetail
	}{
		{
			&api.ResourceQuota{
				ObjectMeta: metaV1.ObjectMeta{Name: "foo"},
				Spec: api.ResourceQuotaSpec{
					Hard: map[api.ResourceName]resource.Quantity{
						api.ResourceMemory: testMemoryQuantity,
					},
					Scopes: []api.ResourceQuotaScope{
						api.ResourceQuotaScopeBestEffort,
					},
				},
				Status: api.ResourceQuotaStatus{
					Hard: map[api.ResourceName]resource.Quantity{
						api.ResourceMemory: testMemoryQuantity,
					},
					Used: map[api.ResourceName]resource.Quantity{
						api.ResourceMemory: testMemoryQuantity,
					},
				},
			},
			&ResourceQuotaDetail{
				TypeMeta:   common.TypeMeta{Kind: "resourcequota"},
				ObjectMeta: common.ObjectMeta{Name: "foo"},
				Scopes: []api.ResourceQuotaScope{
					api.ResourceQuotaScopeBestEffort,
				},
				StatusList: map[api.ResourceName]ResourceStatus{
					api.ResourceMemory: {
						Hard: testMemoryQuantity.String(),
						Used: testMemoryQuantity.String(),
					},
				},
			},
		},
	}
	for _, c := range cases {
		actual := ToResourceQuotaDetail(c.resourceQuotas)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getResourceQuotaDetail(%#v) == \n%#v\nexpected \n%#v\n",
				c.resourceQuotas, actual, c.expected)
		}
	}
}
