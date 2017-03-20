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

package storage

import (
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/persistentvolumeclaim"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	api "k8s.io/client-go/pkg/api/v1"
)

func TestGetStorageFromChannels(t *testing.T) {
	cases := []struct {
		kPvc api.PersistentVolumeClaimList
		pvc  []persistentvolumeclaim.PersistentVolumeClaim
	}{
		{
			api.PersistentVolumeClaimList{},
			[]persistentvolumeclaim.PersistentVolumeClaim{},
		},
		{
			api.PersistentVolumeClaimList{
				Items: []api.PersistentVolumeClaim{{
					ObjectMeta: metav1.ObjectMeta{Name: "pvc"},
					Spec:       api.PersistentVolumeClaimSpec{Selector: &metav1.LabelSelector{}},
				}},
			},
			[]persistentvolumeclaim.PersistentVolumeClaim{{
				ObjectMeta: common.ObjectMeta{
					Name: "pvc",
				},
				TypeMeta: common.TypeMeta{Kind: common.ResourceKindPersistentVolumeClaim},
			}},
		},
	}

	for _, c := range cases {
		expected := &Storage{
			PersistentVolumeClaimList: persistentvolumeclaim.PersistentVolumeClaimList{
				ListMeta: common.ListMeta{TotalItems: len(c.pvc)},
				Items:    c.pvc,
			},
		}
		var expectedErr error

		channels := &common.ResourceChannels{
			PersistentVolumeClaimList: common.PersistentVolumeClaimListChannel{
				List:  make(chan *api.PersistentVolumeClaimList, 1),
				Error: make(chan error, 1),
			},
		}

		channels.PersistentVolumeClaimList.Error <- nil
		channels.PersistentVolumeClaimList.List <- &c.kPvc

		actual, err := GetStorageFromChannels(channels, nil, dataselect.NoDataSelect, nil)
		if !reflect.DeepEqual(actual, expected) {
			t.Errorf("GetStorageFromChannels() ==\n %#v\nExpected: %#v", actual, expected)
		}
		if !reflect.DeepEqual(err, expectedErr) {
			t.Errorf("error from GetStorageFromChannels() == %#v, expected %#v", err, expectedErr)
		}
	}
}
