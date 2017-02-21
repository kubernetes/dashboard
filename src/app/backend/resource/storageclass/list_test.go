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

package storageclass

import (
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes/fake"
	storage "k8s.io/client-go/pkg/apis/storage/v1beta1"
)

func TestGetStorageClassList(t *testing.T) {
	cases := []struct {
		serviceList     *storage.StorageClassList
		expectedActions []string
		expected        *StorageClassList
	}{
		{
			serviceList: &storage.StorageClassList{
				Items: []storage.StorageClass{
					{
						ObjectMeta: metaV1.ObjectMeta{
							Name:   "storage-1",
							Labels: map[string]string{},
						},
					},
				}},
			expectedActions: []string{"list"},
			expected: &StorageClassList{
				ListMeta: common.ListMeta{TotalItems: 1},
				StorageClasses: []StorageClass{
					{
						ObjectMeta: common.ObjectMeta{
							Name:   "storage-1",
							Labels: map[string]string{},
						},
						TypeMeta: common.TypeMeta{Kind: common.ResourceKindStorageClass},
					},
				},
			},
		},
	}

	for _, c := range cases {
		fakeClient := fake.NewSimpleClientset(c.serviceList)

		actual, _ := GetStorageClassList(fakeClient, dataselect.NoDataSelect)

		actions := fakeClient.Actions()
		if len(actions) != len(c.expectedActions) {
			t.Errorf("Unexpected actions: %v, expected %d actions got %d", actions,
				len(c.expectedActions), len(actions))
			continue
		}

		for i, verb := range c.expectedActions {
			if actions[i].GetVerb() != verb {
				t.Errorf("Unexpected action: %+v, expected %s",
					actions[i], verb)
			}
		}

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetStorageClassList(client) == got\n%#v, expected\n %#v", actual, c.expected)
		}
	}
}
