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
	apiextensions "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1"
	"k8s.io/apiextensions-apiserver/pkg/client/clientset/clientset/fake"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/kubernetes/scheme"
	"k8s.io/client-go/rest"
	"k8s.io/dashboard/api/pkg/resource/customresourcedefinition/types"
	"reflect"
	"strings"
	"testing"

	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/dashboard/api/pkg/resource/dataselect"
)

type SampleCustomResourceSpec struct {
	Field1 string `json:"field1"`
	Field2 int32  `json:"field2"`
}

type SampleCustomResourceStatus struct{}

// +genclient
// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

type SampleCustomResource struct {
	metaV1.TypeMeta   `json:",inline"`
	metaV1.ObjectMeta `json:"metadata,omitempty" protobuf:"bytes,1,opt,name=metadata"`

	Spec SampleCustomResourceSpec `json:"spec,omitempty" protobuf:"bytes,2,opt,name=spec"`

	Status SampleCustomResourceStatus `json:"status,omitempty" protobuf:"bytes,3,opt,name=status"`
}

func (s SampleCustomResource) GetObjectKind() schema.ObjectKind {
	return schema.EmptyObjectKind
}

func (s SampleCustomResource) DeepCopyObject() runtime.Object {
	return s
}

func createCustomResourceDefinition(fqName string) *apiextensions.CustomResourceDefinition {
	splitName := strings.Split(fqName, ".")
	name := splitName[0]
	group := splitName[1]
	return &apiextensions.CustomResourceDefinition{
		TypeMeta: metaV1.TypeMeta{
			Kind:       "CustomResourceDefinition",
			APIVersion: "apiextensions.k8s.io/v1",
		},
		ObjectMeta: metaV1.ObjectMeta{
			Name: fqName,
		},
		Spec: apiextensions.CustomResourceDefinitionSpec{
			Group: group,
			Names: apiextensions.CustomResourceDefinitionNames{
				Kind:       "SampleCustomResource",
				Plural:     name,
				ShortNames: []string{"scr"},
			},
			Scope: apiextensions.NamespaceScoped,
			Versions: []apiextensions.CustomResourceDefinitionVersion{
				{
					Name:    "v1alpha1",
					Served:  true,
					Storage: true,
					Schema: &apiextensions.CustomResourceValidation{
						OpenAPIV3Schema: &apiextensions.JSONSchemaProps{
							Type: "object",
							Properties: map[string]apiextensions.JSONSchemaProps{
								"field1": {
									Type: "string",
								},
								"field2": {
									Type: "integer",
								},
							},
						},
					},
					AdditionalPrinterColumns: []apiextensions.CustomResourceColumnDefinition{
						{
							Name:     "Field1",
							JSONPath: ".spec.field1",
							Priority: 2,
						},
						{
							Name:     "Field2",
							JSONPath: ".spec.field2",
							Type:     "integer",
						},
					},
				},
			},
		},
		Status: apiextensions.CustomResourceDefinitionStatus{},
	}
}

func createCustomResourceObject(name, namespace, field1 string, field2 int32) *SampleCustomResource {
	return &SampleCustomResource{
		ObjectMeta: metaV1.ObjectMeta{
			Name:      name,
			Namespace: namespace,
		},
		TypeMeta: metaV1.TypeMeta{
			Kind:       "SampleCustomResource",
			APIVersion: "sample-controller.k8s.io/v1alpha1",
		},
		Spec: SampleCustomResourceSpec{
			Field1: field1,
			Field2: field2,
		},
	}
}

func TestGetCustomResourceDefinitionDetail(t *testing.T) {
	crd := createCustomResourceDefinition("sample-controller.k8s.io")
	crdObject := createCustomResourceObject("ns-1", "scr-1", "string-field-1", 100)

	gv := schema.GroupVersion{
		Group:   "sample-controller.k8s.io",
		Version: "v1alpha1",
	}

	// Register the type and GroupVersion with the scheme.
	metaV1.AddToGroupVersion(scheme.Scheme, gv)
	scheme.Scheme.AddKnownTypes(gv, crd) // Register your custom resource type

	cases := []struct {
		namespace, name string
		expectedActions []string
		crdObject       *SampleCustomResource
		expected        *types.CustomResourceDefinitionDetail
	}{
		{
			"ns-1", "scr1",
			[]string{"get"},
			crdObject,
			&types.CustomResourceDefinitionDetail{
				CustomResourceDefinition: types.CustomResourceDefinition{},
			},
		},
	}

	for _, c := range cases {
		fakeClient := fake.NewSimpleClientset(crd, c.crdObject)
		fakeRestConfig := &rest.Config{}
		dataselect.DefaultDataSelectWithMetrics.MetricQuery = dataselect.NoMetrics
		actual, _ := GetCustomResourceDefinitionDetail(fakeClient, fakeRestConfig, c.name)

		actions := fakeClient.Actions()
		if len(actions) != len(c.expectedActions) {
			t.Errorf("Unexpected actions: %v, expected %d actions got %d", actions,
				len(c.expectedActions), len(actions))
			continue
		}

		for i, verb := range c.expectedActions {
			if actions[i].GetVerb() != verb {
				t.Errorf("Unexpected action: %+v, expected %s", actions[i], verb)
			}
		}

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetCustomResourceDefinitionDetail(client, config, name) == \ngot: %#v, \nexpected %#v",
				actual, c.expected)
		}
	}
}
