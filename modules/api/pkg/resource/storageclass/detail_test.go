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

	storage "k8s.io/api/storage/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	"k8s.io/dashboard/types"
)

func TestToStorageClass(t *testing.T) {
	cases := []struct {
		storage  *storage.StorageClass
		expected StorageClass
	}{
		{
			storage: &storage.StorageClass{},
			expected: StorageClass{
				TypeMeta: types.TypeMeta{Kind: types.ResourceKindStorageClass},
			},
		}, {
			storage: &storage.StorageClass{
				ObjectMeta: metaV1.ObjectMeta{Name: "test-storage"}},
			expected: StorageClass{
				ObjectMeta: types.ObjectMeta{Name: "test-storage"},
				TypeMeta:   types.TypeMeta{Kind: types.ResourceKindStorageClass},
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
