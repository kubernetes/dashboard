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

package storageclass

import (
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/persistentvolume"
	storage "k8s.io/api/storage/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func TestToStorageClass(t *testing.T) {
	cases := []struct {
		storage  *storage.StorageClass
		expected StorageClass
	}{
		{
			storage: &storage.StorageClass{},
			expected: StorageClass{
				TypeMeta: api.TypeMeta{Kind: api.ResourceKindStorageClass},
			},
		}, {
			storage: &storage.StorageClass{
				ObjectMeta: metaV1.ObjectMeta{Name: "test-storage"}},
			expected: StorageClass{
				ObjectMeta: api.ObjectMeta{Name: "test-storage"},
				TypeMeta:   api.TypeMeta{Kind: api.ResourceKindStorageClass},
			},
		},
	}

	for _, c := range cases {
		actual := toStorageClass(c.storage)

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("toStorageClass(%#v) == \ngot %#v, \nexpected %#v", c.storage, actual, c.expected)
		}
	}
}

func TestToStorageClassDetail(t *testing.T) {
	cases := []struct {
		storage              *storage.StorageClass
		persistentVolumeList persistentvolume.PersistentVolumeList
		expected             StorageClassDetail
	}{
		{
			&storage.StorageClass{},
			persistentvolume.PersistentVolumeList{},
			StorageClassDetail{
				TypeMeta: api.TypeMeta{Kind: api.ResourceKindStorageClass},
			},
		},
		{
			&storage.StorageClass{ObjectMeta: metaV1.ObjectMeta{Name: "storage-class"}},
			persistentvolume.PersistentVolumeList{Items: []persistentvolume.PersistentVolume{{ObjectMeta: api.ObjectMeta{Name: "pv-1"}}}},
			StorageClassDetail{
				ObjectMeta: api.ObjectMeta{Name: "storage-class"},
				TypeMeta:   api.TypeMeta{Kind: api.ResourceKindStorageClass},
				PersistentVolumeList: persistentvolume.PersistentVolumeList{
					Items: []persistentvolume.PersistentVolume{{
						ObjectMeta: api.ObjectMeta{Name: "pv-1"},
					}},
				},
			},
		},
	}

	for _, c := range cases {
		actual := toStorageClassDetail(c.storage, &c.persistentVolumeList)

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("toStorageClassDetail(%#v, %#v) == \ngot %#v, \nexpected %#v",
				c.storage, c.persistentVolumeList, actual, c.expected)
		}
	}
}
