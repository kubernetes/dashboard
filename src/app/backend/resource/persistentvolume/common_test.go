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

	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	api "k8s.io/client-go/pkg/api/v1"
)

func TestGetPersistentVolumeClaim(t *testing.T) {
	cases := []struct {
		persistentVolume *api.PersistentVolume
		expected         string
	}{
		{
			&api.PersistentVolume{
				ObjectMeta: metaV1.ObjectMeta{Name: "foo"},
				Spec: api.PersistentVolumeSpec{
					ClaimRef: &api.ObjectReference{
						Namespace: "default",
						Name:      "my-claim"},
				},
			},
			"default/my-claim",
		},
		{
			&api.PersistentVolume{
				ObjectMeta: metaV1.ObjectMeta{Name: "foo"},
				Spec:       api.PersistentVolumeSpec{},
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
