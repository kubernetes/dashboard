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

package ingressclass

import (
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	networkingv1 "k8s.io/api/networking/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func TestToIngressClassDetails(t *testing.T) {
	paramRef := networkingv1.IngressClassParametersReference{Kind: "pods", Name: "test"}
	apiGroup := "k8s.example.com"
	scope := "Namespace"
	paramFullRef := networkingv1.IngressClassParametersReference{Kind: "pods", Name: "test", APIGroup: &apiGroup, Scope: &scope}
	cases := []struct {
		ingressClass *networkingv1.IngressClass
		expected     IngressClassDetail
	}{
		{
			ingressClass: &networkingv1.IngressClass{
				ObjectMeta: metaV1.ObjectMeta{Name: "test-ic"},
				Spec:       networkingv1.IngressClassSpec{Controller: "k8s.io/ingress-nginx", Parameters: &paramRef},
			},
			expected: IngressClassDetail{
				IngressClass: IngressClass{
					ObjectMeta: api.ObjectMeta{Name: "test-ic"},
					TypeMeta:   api.TypeMeta{Kind: "ingressclass"},
					Controller: "k8s.io/ingress-nginx"},
				Parameters: map[string]string{"Kind": "pods", "Name": "test"},
			},
		}, {
			ingressClass: &networkingv1.IngressClass{
				ObjectMeta: metaV1.ObjectMeta{Name: "test-ic"},
				Spec:       networkingv1.IngressClassSpec{Controller: "k8s.io/ingress-nginx", Parameters: &paramFullRef},
			},
			expected: IngressClassDetail{
				IngressClass: IngressClass{
					ObjectMeta: api.ObjectMeta{Name: "test-ic"},
					TypeMeta:   api.TypeMeta{Kind: "ingressclass"},
					Controller: "k8s.io/ingress-nginx"},
				Parameters: map[string]string{"ApiGroup": "k8s.example.com", "Kind": "pods", "Name": "test", "Scope": "Namespace"},
			},
		},
	}

	for _, c := range cases {
		actual := toIngressClassDetail(c.ingressClass)

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("toIngressClassDetails(%#v) == \ngot %#v, \nexpected %#v", c.ingressClass, actual, c.expected)
		}
	}
}
