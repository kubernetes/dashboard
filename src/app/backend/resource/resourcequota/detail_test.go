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

package resourcequota

import (
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	v1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/resource"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func TestGetResourceQuotaDetail(t *testing.T) {

	testMemoryQuantity, _ := resource.ParseQuantity("6G")

	cases := []struct {
		resourceQuotas *v1.ResourceQuota
		expected       *ResourceQuotaDetail
	}{
		{
			&v1.ResourceQuota{
				ObjectMeta: metaV1.ObjectMeta{Name: "foo"},
				Spec: v1.ResourceQuotaSpec{
					Hard: map[v1.ResourceName]resource.Quantity{
						v1.ResourceMemory: testMemoryQuantity,
					},
					Scopes: []v1.ResourceQuotaScope{
						v1.ResourceQuotaScopeBestEffort,
					},
				},
				Status: v1.ResourceQuotaStatus{
					Hard: map[v1.ResourceName]resource.Quantity{
						v1.ResourceMemory: testMemoryQuantity,
					},
					Used: map[v1.ResourceName]resource.Quantity{
						v1.ResourceMemory: testMemoryQuantity,
					},
				},
			},
			&ResourceQuotaDetail{
				TypeMeta:   api.TypeMeta{Kind: "resourcequota"},
				ObjectMeta: api.ObjectMeta{Name: "foo"},
				Scopes: []v1.ResourceQuotaScope{
					v1.ResourceQuotaScopeBestEffort,
				},
				StatusList: map[v1.ResourceName]ResourceStatus{
					v1.ResourceMemory: {
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
