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
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"

	v1 "k8s.io/api/core/v1"
	storage "k8s.io/api/storage/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes/fake"
)

func TestGetPersistentVolumeClaim(t *testing.T) {
	cases := []struct {
		persistentVolume *v1.PersistentVolume
		expected         string
	}{
		{
			&v1.PersistentVolume{
				ObjectMeta: metaV1.ObjectMeta{Name: "foo"},
				Spec: v1.PersistentVolumeSpec{
					ClaimRef: &v1.ObjectReference{
						Namespace: "default",
						Name:      "my-claim"},
				},
			},
			"default/my-claim",
		},
		{
			&v1.PersistentVolume{
				ObjectMeta: metaV1.ObjectMeta{Name: "foo"},
				Spec:       v1.PersistentVolumeSpec{},
			},
			"",
		},
	}
	for _, c := range cases {
		actual := getPersistentVolumeClaim(c.persistentVolume)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("getPersistentVolumeClaim(%#v) == \n%#v\nexpected \n%#v\n",
				c.persistentVolume, actual, c.expected)
		}
	}
}

func TestGetStorageClassPersistentVolumes(t *testing.T) {
	cases := []struct {
		storageClass         *storage.StorageClass
		name                 string
		persistentVolumeList *v1.PersistentVolumeList
		expected             *PersistentVolumeList
	}{
		{
			storageClass: &storage.StorageClass{ObjectMeta: metaV1.ObjectMeta{
				Name: "test-storage", Labels: map[string]string{"app": "test"},
			}},
			name: "test-storage",
			persistentVolumeList: &v1.PersistentVolumeList{Items: []v1.PersistentVolume{
				{
					ObjectMeta: metaV1.ObjectMeta{
						Name: "pv-1", Labels: map[string]string{"app": "test"},
					},
					Spec: v1.PersistentVolumeSpec{
						StorageClassName: "test-storage",
					},
				},
			}},
			expected: &PersistentVolumeList{
				ListMeta: api.ListMeta{TotalItems: 1},
				Items: []PersistentVolume{{
					TypeMeta:     api.TypeMeta{Kind: api.ResourceKindPersistentVolume},
					StorageClass: "test-storage",
					ObjectMeta: api.ObjectMeta{Name: "pv-1",
						Labels: map[string]string{"app": "test"}},
				}},
				Errors: []error{},
			},
		},
	}

	for _, c := range cases {

		fakeClient := fake.NewSimpleClientset(c.persistentVolumeList, c.storageClass)

		actual, _ := GetStorageClassPersistentVolumes(fakeClient, c.name, dataselect.NoDataSelect)

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetStorageClassPersistentVolumes(client, %#v) == \ngot: %#v, \nexpected %#v",
				c.name, actual, c.expected)
		}
	}
}
