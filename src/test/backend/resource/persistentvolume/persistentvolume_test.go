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

package persistentvolume

import (
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"k8s.io/kubernetes/pkg/api"
)

func TestGetPersistentVolumeList(t *testing.T) {
	cases := []struct {
		persistentVolumes []api.PersistentVolume
		expected          *PersistentVolumeList
	}{
		{nil, &PersistentVolumeList{Items: []PersistentVolume{}}},
		{
			[]api.PersistentVolume{
				{ObjectMeta: api.ObjectMeta{Name: "foo"}},
			},
			&PersistentVolumeList{
				ListMeta: common.ListMeta{TotalItems: 1},
				Items: []PersistentVolume{{
					TypeMeta:   common.TypeMeta{Kind: "persistentvolume"},
					ObjectMeta: common.ObjectMeta{Name: "foo"},
				}},
			},
		},
	}
	for _, c := range cases {
		actual := getPersistentVolumeList(c.persistentVolumes, common.NoDataSelect)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getPersistentVolumeList(%#v) == \n%#v\nexpected \n%#v\n",
				c.persistentVolumes, actual, c.expected)
		}
	}
}
