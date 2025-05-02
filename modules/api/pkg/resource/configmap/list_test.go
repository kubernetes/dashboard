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

package configmap

import (
	"reflect"
	"testing"

	v1 "k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	"k8s.io/dashboard/api/pkg/resource/dataselect"
	"k8s.io/dashboard/types"
)

func TestToConfigMapList(t *testing.T) {
	cases := []struct {
		configMaps []v1.ConfigMap
		expected   *ConfigMapList
	}{
		{nil, &ConfigMapList{Items: []ConfigMap{}}},
		{
			[]v1.ConfigMap{
				{Data: map[string]string{"app": "my-name"}, ObjectMeta: metaV1.ObjectMeta{Name: "foo"}},
			},
			&ConfigMapList{
				ListMeta: types.ListMeta{TotalItems: 1},
				Items: []ConfigMap{{
					TypeMeta:   types.TypeMeta{Kind: "configmap"},
					ObjectMeta: types.ObjectMeta{Name: "foo"},
				}},
			},
		},
	}
	for _, c := range cases {
		actual := toConfigMapList(c.configMaps, nil, dataselect.NoDataSelect)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("toConfigMapList(%#v) == \n%#v\nexpected \n%#v\n",
				c.configMaps, actual, c.expected)
		}
	}
}
