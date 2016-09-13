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
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"k8s.io/kubernetes/pkg/api"
)

func TestGetResourceQuotaList(t *testing.T) {
	cases := []struct {
		resourceQuotas []api.ResourceQuota
		expected       *ResourceQuotaList
	}{
		{nil, &ResourceQuotaList{Items: []ResourceQuota{}}},
		{
			[]api.ResourceQuota{
				{ObjectMeta: api.ObjectMeta{Name: "foo"}},
			},
			&ResourceQuotaList{
				ListMeta: common.ListMeta{TotalItems: 1},
				Items: []ResourceQuota{{
					TypeMeta:   common.TypeMeta{Kind: "resourcequota"},
					ObjectMeta: common.ObjectMeta{Name: "foo"},
				}},
			},
		},
	}
	for _, c := range cases {
		actual := getResourceQuotaList(c.resourceQuotas, dataselect.NoDataSelect)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getResourceQuotaList(%#v) == \n%#v\nexpected \n%#v\n",
				c.resourceQuotas, actual, c.expected)
		}
	}
}
