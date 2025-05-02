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

	networkingv1 "k8s.io/api/networking/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes/fake"

	"k8s.io/dashboard/api/pkg/resource/dataselect"
	"k8s.io/dashboard/types"
)

func TestGetIngressClassList(t *testing.T) {
	cases := []struct {
		ingressClassList *networkingv1.IngressClassList
		expectedActions  []string
		expected         *IngressClassList
	}{
		{
			ingressClassList: &networkingv1.IngressClassList{
				Items: []networkingv1.IngressClass{
					{
						ObjectMeta: metaV1.ObjectMeta{
							Name:   "ingress-1",
							Labels: map[string]string{},
						},
					},
				}},
			expectedActions: []string{"list"},
			expected: &IngressClassList{
				ListMeta: types.ListMeta{TotalItems: 1},
				Items: []IngressClass{
					{
						ObjectMeta: types.ObjectMeta{
							Name:   "ingress-1",
							Labels: map[string]string{},
						},
						TypeMeta: types.TypeMeta{Kind: types.ResourceKindIngressClass},
					},
				},
				Errors: []error{},
			},
		},
	}

	for _, c := range cases {
		fakeClient := fake.NewSimpleClientset(c.ingressClassList)

		actual, _ := GetIngressClassList(fakeClient, dataselect.NoDataSelect)

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
			t.Errorf("GetIngressClassList(client) == got\n%#v, expected\n %#v", actual, c.expected)
		}
	}
}

func TestToIngressClass(t *testing.T) {
	paramRef := networkingv1.IngressClassParametersReference{Kind: "pods", Name: "test"}
	cases := []struct {
		ingressClass *networkingv1.IngressClass
		expected     IngressClass
	}{
		{
			ingressClass: &networkingv1.IngressClass{},
			expected: IngressClass{
				TypeMeta: types.TypeMeta{Kind: types.ResourceKindIngressClass},
			},
		}, {
			ingressClass: &networkingv1.IngressClass{
				ObjectMeta: metaV1.ObjectMeta{Name: "test-ic"}},
			expected: IngressClass{
				ObjectMeta: types.ObjectMeta{Name: "test-ic"},
				TypeMeta:   types.TypeMeta{Kind: types.ResourceKindIngressClass},
			},
		}, {
			ingressClass: &networkingv1.IngressClass{
				ObjectMeta: metaV1.ObjectMeta{Name: "test-ic"},
				Spec:       networkingv1.IngressClassSpec{Controller: "k8s.io/ingress-nginx"},
			},
			expected: IngressClass{
				ObjectMeta: types.ObjectMeta{Name: "test-ic"},
				TypeMeta:   types.TypeMeta{Kind: types.ResourceKindIngressClass},
				Controller: "k8s.io/ingress-nginx",
			},
		}, {
			ingressClass: &networkingv1.IngressClass{
				ObjectMeta: metaV1.ObjectMeta{Name: "test-ic"},
				Spec:       networkingv1.IngressClassSpec{Controller: "k8s.io/ingress-nginx", Parameters: &paramRef},
			},
			expected: IngressClass{
				ObjectMeta: types.ObjectMeta{Name: "test-ic"},
				TypeMeta:   types.TypeMeta{Kind: types.ResourceKindIngressClass},
				Controller: "k8s.io/ingress-nginx",
			},
		},
	}

	for _, c := range cases {
		actual := toIngressClass(c.ingressClass)

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("toIngressClass(%#v) == \ngot %#v, \nexpected %#v", c.ingressClass, actual, c.expected)
		}
	}
}
