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

package persistentvolumeclaim

import (
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"

	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	api "k8s.io/client-go/pkg/api/v1"
)

func TestGetPersistentVolumeClaimDetail(t *testing.T) {

	cases := []struct {
		persistentVolumeClaims *api.PersistentVolumeClaim
		expected               *PersistentVolumeClaimDetail
	}{
		{
			&api.PersistentVolumeClaim{
				TypeMeta:   metaV1.TypeMeta{Kind: "persistentvolumeclaim"},
				ObjectMeta: metaV1.ObjectMeta{Name: "foo", Namespace: "bar"},
				Spec: api.PersistentVolumeClaimSpec{
					AccessModes: []api.PersistentVolumeAccessMode{api.ReadWriteOnce},
					Resources:   api.ResourceRequirements{},
					VolumeName:  "volume",
				},
				Status: api.PersistentVolumeClaimStatus{
					Phase:       api.PersistentVolumeClaimPhase(api.ClaimPending),
					AccessModes: []api.PersistentVolumeAccessMode{api.ReadWriteOnce},
					Capacity:    nil,
				},
			},
			&PersistentVolumeClaimDetail{
				ObjectMeta:  common.ObjectMeta{Name: "foo", Namespace: "bar"},
				TypeMeta:    common.TypeMeta{Kind: "persistentvolumeclaim"},
				Status:      api.ClaimPending,
				Volume:      "volume",
				Capacity:    nil,
				AccessModes: []api.PersistentVolumeAccessMode{api.ReadWriteOnce},
			},
		},
	}
	for _, c := range cases {
		actual := getPersistentVolumeClaimDetail(c.persistentVolumeClaims)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getPersistentVolumeClaimDetail(%#v) == \n%#v\nexpected \n%#v\n",
				c.persistentVolumeClaims, actual, c.expected)
		}
	}
}
