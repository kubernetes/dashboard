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

package configmap

import (
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	api "k8s.io/client-go/pkg/api/v1"
)

func TestGetConfigMapList(t *testing.T) {
	cases := []struct {
		configMaps []api.ConfigMap
		expected   *ConfigMapList
	}{
		{nil, &ConfigMapList{Items: []ConfigMap{}}},
		{
			[]api.ConfigMap{
				{Data: map[string]string{"app": "my-name"}, ObjectMeta: metaV1.ObjectMeta{Name: "foo"}},
			},
			&ConfigMapList{
				ListMeta: common.ListMeta{TotalItems: 1},
				Items: []ConfigMap{{
					TypeMeta:   common.TypeMeta{Kind: "configmap"},
					ObjectMeta: common.ObjectMeta{Name: "foo"},
				}},
			},
		},
	}
	for _, c := range cases {
		actual := getConfigMapList(c.configMaps, dataselect.NoDataSelect)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getConfigMapList(%#v) == \n%#v\nexpected \n%#v\n",
				c.configMaps, actual, c.expected)
		}
	}
}
