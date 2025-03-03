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

	"github.com/samber/lo"
	policyv1 "k8s.io/api/policy/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/intstr"
	"k8s.io/dashboard/types"
)

func TestToDetails(t *testing.T) {
	cases := []struct {
		resource *policyv1.PodDisruptionBudget
		expected *PodDisruptionBudgetDetail
	}{
		{
			&policyv1.PodDisruptionBudget{
				ObjectMeta: metaV1.ObjectMeta{Name: "foo", Namespace: "bar"},
				TypeMeta:   metaV1.TypeMeta{Kind: types.ResourceKindPodDisruptionBudget},
				Spec: policyv1.PodDisruptionBudgetSpec{
					MinAvailable:               &intstr.IntOrString{Type: intstr.Int, IntVal: 1},
					MaxUnavailable:             &intstr.IntOrString{Type: intstr.Int, IntVal: 3},
					UnhealthyPodEvictionPolicy: lo.ToPtr(policyv1.IfHealthyBudget),
				},
				Status: policyv1.PodDisruptionBudgetStatus{
					CurrentHealthy:     10,
					DesiredHealthy:     10,
					ExpectedPods:       10,
					DisruptedPods:      make(map[string]metaV1.Time),
					DisruptionsAllowed: 0,
				},
			},
			&PodDisruptionBudgetDetail{
				PodDisruptionBudget: PodDisruptionBudget{
					ObjectMeta:                 types.ObjectMeta{Name: "foo", Namespace: "bar"},
					TypeMeta:                   types.TypeMeta{Kind: types.ResourceKindPodDisruptionBudget},
					MinAvailable:               &intstr.IntOrString{Type: intstr.Int, IntVal: 1},
					MaxUnavailable:             &intstr.IntOrString{Type: intstr.Int, IntVal: 3},
					UnhealthyPodEvictionPolicy: lo.ToPtr(policyv1.IfHealthyBudget),
					CurrentHealthy:             10,
					DesiredHealthy:             10,
					ExpectedPods:               10,
					DisruptionsAllowed:         0,
				},
				DisruptedPods: make(map[string]metaV1.Time),
			},
		},
	}
	for _, c := range cases {
		actual := toDetails(*c.resource)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("toDetails(%#v) == \n%#v\nexpected \n%#v\n",
				c.resource, actual, c.expected)
		}
	}
}
