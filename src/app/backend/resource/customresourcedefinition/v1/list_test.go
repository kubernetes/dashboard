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

package v1

import (
	"reflect"
	"testing"

	"k8s.io/apiextensions-apiserver/pkg/apis/apiextensions"
	apiextensionsv1 "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1"
	"k8s.io/apiextensions-apiserver/pkg/client/clientset/clientset/fake"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/customresourcedefinition/types"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
)

func TestGetCustomResourceDefinition(t *testing.T) {
	cases := []struct {
		expectedActions []string
		crdList         *apiextensionsv1.CustomResourceDefinitionList
		expected        *types.CustomResourceDefinitionList
	}{
		{
			[]string{"list"},
			&apiextensionsv1.CustomResourceDefinitionList{
				Items: []apiextensionsv1.CustomResourceDefinition{
					{
						ObjectMeta: metaV1.ObjectMeta{Name: "foos.samplecontroller.k8s.io"},
						Spec: apiextensionsv1.CustomResourceDefinitionSpec{
							Names: apiextensionsv1.CustomResourceDefinitionNames{
								Kind:   "Foo",
								Plural: "foos",
							},
							Versions: []apiextensionsv1.CustomResourceDefinitionVersion{
								{
									Served: true,
									Name:   "v1alpha1",
								},
							},
						},
					},
				},
			},
			&types.CustomResourceDefinitionList{
				ListMeta: api.ListMeta{TotalItems: 1},
				Items: []types.CustomResourceDefinition{
					{
						ObjectMeta:  api.ObjectMeta{Name: "foos.samplecontroller.k8s.io"},
						TypeMeta:    api.TypeMeta{Kind: api.ResourceKindCustomResourceDefinition},
						Version:     "v1alpha1",
						Established: apiextensions.ConditionUnknown,
					},
				},
				Errors: []error{},
			},
		}, {
			[]string{"list"},
			&apiextensionsv1.CustomResourceDefinitionList{
				Items: []apiextensionsv1.CustomResourceDefinition{
					{
						ObjectMeta: metaV1.ObjectMeta{Name: "foos.samplecontroller.k8s.io"},
						Spec: apiextensionsv1.CustomResourceDefinitionSpec{
							Names: apiextensionsv1.CustomResourceDefinitionNames{
								Kind:   "Foo",
								Plural: "foos",
							},
							Versions: []apiextensionsv1.CustomResourceDefinitionVersion{
								{
									Served: true,
									Name:   "v1alpha1",
								},
								{
									Served: false,
									Name:   "v1beta1",
								},
								{
									Served: true,
									Name:   "v1gamma1",
								},
								{
									Served: false,
									Name:   "v1zeta1",
								},
							},
						},
					},
				},
			},
			&types.CustomResourceDefinitionList{
				ListMeta: api.ListMeta{TotalItems: 1},
				Items: []types.CustomResourceDefinition{
					{
						ObjectMeta:  api.ObjectMeta{Name: "foos.samplecontroller.k8s.io"},
						TypeMeta:    api.TypeMeta{Kind: api.ResourceKindCustomResourceDefinition},
						Version:     "v1alpha1",
						Established: apiextensions.ConditionUnknown,
					},
				},
				Errors: []error{},
			},
		},
	}

	for _, c := range cases {
		fakeClient := fake.NewSimpleClientset(c.crdList)

		actual, _ := GetCustomResourceDefinitionList(fakeClient, dataselect.DefaultDataSelect)

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
			t.Errorf("GetCustomResourceDefinitionList(client, nil) == \ngot: %#v, \nexpected %#v",
				actual, c.expected)
		}
	}
}
