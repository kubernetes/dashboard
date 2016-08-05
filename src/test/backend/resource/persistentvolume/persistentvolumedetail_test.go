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

func TestGetPersistentVolumeDetail(t *testing.T) {

	cases := []struct {
		persistentVolumes *api.PersistentVolume
		expected          *PersistentVolumeDetail
	}{
		{
			&api.PersistentVolume{
				ObjectMeta: api.ObjectMeta{Name: "foo"},
				Spec: api.PersistentVolumeSpec{
					PersistentVolumeReclaimPolicy: api.PersistentVolumeReclaimRecycle,
					AccessModes:                   []api.PersistentVolumeAccessMode{api.ReadWriteOnce},
					Capacity:                      nil,
					ClaimRef:                      &api.ObjectReference{Name: "myclaim-name"},
					PersistentVolumeSource: api.PersistentVolumeSource{
						HostPath: &api.HostPathVolumeSource{
							Path: "my-path",
						},
					},
				},
				Status: api.PersistentVolumeStatus{
					Phase:   api.VolumePending,
					Message: "my-message",
				},
			},
			&PersistentVolumeDetail{
				TypeMeta:      common.TypeMeta{Kind: "persistentvolume"},
				ObjectMeta:    common.ObjectMeta{Name: "foo"},
				Status:        api.VolumePending,
				ReclaimPolicy: api.PersistentVolumeReclaimRecycle,
				AccessModes:   []api.PersistentVolumeAccessMode{api.ReadWriteOnce},
				Capacity:      nil,
				Claim:         "myclaim-name",
				Message:       "my-message",
				PersistentVolumeSource: api.PersistentVolumeSource{
					HostPath: &api.HostPathVolumeSource{
						Path: "my-path",
					},
				},
			},
		},
	}
	for _, c := range cases {
		actual := getPersistentVolumeDetail(c.persistentVolumes)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getPersistentVolumeDetail(%#v) == \n%#v\nexpected \n%#v\n",
				c.persistentVolumes, actual, c.expected)
		}
	}
}
