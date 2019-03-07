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

package persistentvolume

import (
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/api"

	v1 "k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes/fake"
)

func TestGetPersistentVolumeDetail(t *testing.T) {
	cases := []struct {
		name             string
		persistentVolume *v1.PersistentVolume
		expected         *PersistentVolumeDetail
	}{
		{
			"foo",
			&v1.PersistentVolume{
				ObjectMeta: metaV1.ObjectMeta{Name: "foo"},
				Spec: v1.PersistentVolumeSpec{
					PersistentVolumeReclaimPolicy: v1.PersistentVolumeReclaimRecycle,
					AccessModes:                   []v1.PersistentVolumeAccessMode{v1.ReadWriteOnce},
					Capacity:                      nil,
					ClaimRef: &v1.ObjectReference{
						Name:      "myclaim-name",
						Namespace: "default",
					},
					PersistentVolumeSource: v1.PersistentVolumeSource{
						HostPath: &v1.HostPathVolumeSource{
							Path: "my-path",
						},
					},
				},
				Status: v1.PersistentVolumeStatus{
					Phase:   v1.VolumePending,
					Message: "my-message",
				},
			},
			&PersistentVolumeDetail{
				PersistentVolume: PersistentVolume{
					TypeMeta:      api.TypeMeta{Kind: "persistentvolume"},
					ObjectMeta:    api.ObjectMeta{Name: "foo"},
					Status:        v1.VolumePending,
					ReclaimPolicy: v1.PersistentVolumeReclaimRecycle,
					AccessModes:   []v1.PersistentVolumeAccessMode{v1.ReadWriteOnce},
					Capacity:      nil,
					Claim:         "default/myclaim-name",
				},
				Message: "my-message",
				PersistentVolumeSource: v1.PersistentVolumeSource{
					HostPath: &v1.HostPathVolumeSource{
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
