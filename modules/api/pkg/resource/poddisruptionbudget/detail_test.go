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

package poddisruptionbudget

import (
	"reflect"
	"testing"

	v1 "k8s.io/api/core/v1"
	policyv1 "k8s.io/api/policy/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	"k8s.io/dashboard/types"
)

func TestGet(t *testing.T) {
	cases := []struct {
		persistentVolumeClaims *policyv1.PodDisruptionBudget
		expected               *PodDisruptionBudgetDetail
	}{
		{
			&policyv1.PodDisruptionBudget{
				TypeMeta:   metaV1.TypeMeta{Kind: "persistentvolumeclaim"},
				ObjectMeta: metaV1.ObjectMeta{Name: "foo", Namespace: "bar"},
				Spec: policyv1.PodDisruptionBudgetSpec{
					AccessModes: []v1.PersistentVolumeAccessMode{v1.ReadWriteOnce},
					Resources:   v1.VolumeResourceRequirements{},
					VolumeName:  "volume",
				},
				Status: policyv1.PodDisruptionBudgetStatus{
					Phase:       v1.PersistentVolumeClaimPhase(v1.ClaimPending),
					AccessModes: []v1.PersistentVolumeAccessMode{v1.ReadWriteOnce},
					Capacity:    nil,
				},
			},
			&PodDisruptionBudgetDetail{
				PodDisruptionBudget: PodDisruptionBudget{
					ObjectMeta:  types.ObjectMeta{Name: "foo", Namespace: "bar"},
					TypeMeta:    types.TypeMeta{Kind: "persistentvolumeclaim"},
					Status:      string(v1.ClaimPending),
					Volume:      "volume",
					Capacity:    nil,
					AccessModes: []v1.PersistentVolumeAccessMode{v1.ReadWriteOnce},
				},
			},
		},
	}
	for _, c := range cases {
		actual := toDetails(*c.persistentVolumeClaims)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("toDetails(%#v) == \n%#v\nexpected \n%#v\n",
				c.persistentVolumeClaims, actual, c.expected)
		}
	}
}
