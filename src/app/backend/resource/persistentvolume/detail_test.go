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
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes/fake"
	api "k8s.io/client-go/pkg/api/v1"
)

func TestGetPersistentVolumeDetail(t *testing.T) {
	cases := []struct {
		name             string
		persistentVolume *api.PersistentVolume
		expected         *PersistentVolumeDetail
	}{
		{
			"foo",
			&api.PersistentVolume{
				ObjectMeta: metaV1.ObjectMeta{Name: "foo"},
				Spec: api.PersistentVolumeSpec{
					PersistentVolumeReclaimPolicy: api.PersistentVolumeReclaimRecycle,
					AccessModes:                   []api.PersistentVolumeAccessMode{api.ReadWriteOnce},
					Capacity:                      nil,
					ClaimRef: &api.ObjectReference{
						Name:      "myclaim-name",
						Namespace: "default",
					},
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
				Claim:         "default/myclaim-name",
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
		fakeClient := fake.NewSimpleClientset(c.persistentVolume)

		actual, err := GetPersistentVolumeDetail(fakeClient, c.name)

		if err != nil {
			t.Errorf("GetPersistentVolumeDetail(%#v) == \ngot err %#v", c.persistentVolume, err)
		}

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetPersistentVolumeDetail(%#v) == \n%#v\nexpected \n%#v\n",
				c.persistentVolume, actual, c.expected)
		}
	}
}
