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

package persistentvolumeclaim

import (
	"reflect"
	"testing"

	v1 "k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes/fake"

	"k8s.io/dashboard/api/pkg/resource/dataselect"
	"k8s.io/dashboard/types"
)

func TestGetPodPersistentVolumeClaims(t *testing.T) {
	cases := []struct {
		pod                       *v1.Pod
		name                      string
		namespace                 string
		persistentVolumeClaimList *v1.PersistentVolumeClaimList
		expected                  *PersistentVolumeClaimList
	}{
		{
			pod: &v1.Pod{
				ObjectMeta: metaV1.ObjectMeta{
					Name: "test-pod", Namespace: "test-namespace", Labels: map[string]string{"app": "test"},
				},
				Spec: v1.PodSpec{
					Volumes: []v1.Volume{{
						Name: "vol-1",
						VolumeSource: v1.VolumeSource{
							PersistentVolumeClaim: &v1.PersistentVolumeClaimVolumeSource{
								ClaimName: "pvc-1",
							},
						},
					}},
				},
			},
			name:      "test-pod",
			namespace: "test-namespace",
			persistentVolumeClaimList: &v1.PersistentVolumeClaimList{Items: []v1.PersistentVolumeClaim{
				{
					ObjectMeta: metaV1.ObjectMeta{
						Name: "pvc-1", Namespace: "test-namespace", Labels: map[string]string{"app": "test"},
					},
				},
			}},
			expected: &PersistentVolumeClaimList{
				ListMeta: types.ListMeta{TotalItems: 1},
				Items: []PersistentVolumeClaim{{
					TypeMeta: types.TypeMeta{Kind: types.ResourceKindPersistentVolumeClaim},
					ObjectMeta: types.ObjectMeta{Name: "pvc-1", Namespace: "test-namespace",
						Labels: map[string]string{"app": "test"}},
				}},
				Errors: []error{},
			},
		},
	}

	for _, c := range cases {

		fakeClient := fake.NewSimpleClientset(c.persistentVolumeClaimList, c.pod)

		actual, _ := GetPodPersistentVolumeClaims(fakeClient, c.namespace, c.name, dataselect.NoDataSelect)

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetPodPersistentVolumeClaims(client, %#v, %#v) == \ngot: %#v, \nexpected %#v",
				c.name, c.namespace, actual, c.expected)
		}
	}
}
