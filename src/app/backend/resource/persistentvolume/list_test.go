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
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	api "k8s.io/client-go/pkg/api/v1"
)

func TestGetPersistentVolumeList(t *testing.T) {
	cases := []struct {
		persistentVolumes []api.PersistentVolume
		expected          *PersistentVolumeList
	}{
		{nil, &PersistentVolumeList{Items: []PersistentVolume{}}},
		{
			[]api.PersistentVolume{
				{
					ObjectMeta: metaV1.ObjectMeta{Name: "foo"},
					Spec: api.PersistentVolumeSpec{
						PersistentVolumeReclaimPolicy: api.PersistentVolumeReclaimRecycle,
						AccessModes:                   []api.PersistentVolumeAccessMode{api.ReadWriteOnce},
						ClaimRef: &api.ObjectReference{
							Name:      "myclaim-name",
							Namespace: "default",
						},
						Capacity: nil,
					},
					Status: api.PersistentVolumeStatus{
						Phase:  api.VolumePending,
						Reason: "my-reason",
					},
				},
			},
			&PersistentVolumeList{
				ListMeta: common.ListMeta{TotalItems: 1},
				Items: []PersistentVolume{{
					TypeMeta:    common.TypeMeta{Kind: "persistentvolume"},
					ObjectMeta:  common.ObjectMeta{Name: "foo"},
					Capacity:    nil,
					AccessModes: []api.PersistentVolumeAccessMode{api.ReadWriteOnce},
					Status:      api.VolumePending,
					Claim:       "default/myclaim-name",
					Reason:      "my-reason",
				}},
			},
		},
	}
	for _, c := range cases {
		actual := getPersistentVolumeList(c.persistentVolumes, dataselect.NoDataSelect)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getPersistentVolumeList(%#v) == \n%#v\nexpected \n%#v\n",
				c.persistentVolumes, actual, c.expected)
		}
	}
}
