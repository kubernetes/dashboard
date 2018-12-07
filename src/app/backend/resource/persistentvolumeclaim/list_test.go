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

package persistentvolumeclaim

import (
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	v1 "k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func TestGetPersistentVolumeClaimList(t *testing.T) {
	cases := []struct {
		persistentVolumeClaims []v1.PersistentVolumeClaim
		expected               *PersistentVolumeClaimList
	}{
		{
			nil,
			&PersistentVolumeClaimList{
				Items: []PersistentVolumeClaim{},
			},
		},
		{
			[]v1.PersistentVolumeClaim{{
				ObjectMeta: metaV1.ObjectMeta{Name: "foo"},
				Spec:       v1.PersistentVolumeClaimSpec{VolumeName: "my-volume"},
				Status:     v1.PersistentVolumeClaimStatus{Phase: v1.ClaimBound},
			}},
			&PersistentVolumeClaimList{
				ListMeta: api.ListMeta{TotalItems: 1},
				Items: []PersistentVolumeClaim{{
					TypeMeta:   api.TypeMeta{Kind: "persistentvolumeclaim"},
					ObjectMeta: api.ObjectMeta{Name: "foo"},
					Status:     "Bound",
					Volume:     "my-volume",
				}},
			},
		},
	}
	for _, c := range cases {
		actual := toPersistentVolumeClaimList(c.persistentVolumeClaims, nil, dataselect.NoDataSelect)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getPersistentVolumeClaimList(%#v) == \n%#v\nexpected \n%#v\n",
				c.persistentVolumeClaims, actual, c.expected)
		}
	}
}
