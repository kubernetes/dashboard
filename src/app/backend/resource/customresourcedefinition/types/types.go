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

package types

import (
	"encoding/json"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	"k8s.io/apiextensions-apiserver/pkg/apis/apiextensions"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
)

// CustomResourceDefinitionList contains a list of Custom Resource Definitions in the cluster.
type CustomResourceDefinitionList struct {
	ListMeta api.ListMeta `json:"listMeta"`

	// Unordered list of custom resource definitions
	Items []CustomResourceDefinition `json:"items"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

// CustomResourceDefinition represents a custom resource definition.
type CustomResourceDefinition struct {
	ObjectMeta  api.ObjectMeta                `json:"objectMeta"`
	TypeMeta    api.TypeMeta                  `json:"typeMeta"`
	Version     string                        `json:"version,omitempty"`
	Group       string                        `json:"group"`
	Scope       apiextensions.ResourceScope   `json:"scope"`
	Names       CustomResourceDefinitionNames `json:"names"`
	Established apiextensions.ConditionStatus `json:"established"`
}

type CustomResourceDefinitionDetail struct {
	CustomResourceDefinition `json:",inline"`

	Versions     []CustomResourceDefinitionVersion `json:"versions,omitempty"`
	Conditions   []common.Condition                `json:"conditions"`
	Objects      CustomResourceObjectList          `json:"objects"`
	Subresources []string                          `json:"subresources"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

type CustomResourceDefinitionVersion struct {
	Name    string `json:"name"`
	Served  bool   `json:"served"`
	Storage bool   `json:"storage"`
}

// CustomResourceObject represents a custom resource object.
type CustomResourceObject struct {
	TypeMeta   api.TypeMeta   `json:"typeMeta"`
	ObjectMeta api.ObjectMeta `json:"objectMeta"`
}

func (r *CustomResourceObject) UnmarshalJSON(data []byte) error {
	tempStruct := &struct {
		metav1.TypeMeta `json:",inline"`
		ObjectMeta      metav1.ObjectMeta `json:"metadata,omitempty"`
	}{}

	err := json.Unmarshal(data, &tempStruct)
	if err != nil {
		return err
	}

	r.TypeMeta = api.NewTypeMeta(api.ResourceKind(tempStruct.TypeMeta.Kind))
	r.ObjectMeta = api.NewObjectMeta(tempStruct.ObjectMeta)
	return nil
}

type CustomResourceObjectDetail struct {
	CustomResourceObject `json:",inline"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

// CustomResourceObjectList represents crd objects in a namespace.
type CustomResourceObjectList struct {
	TypeMeta metav1.TypeMeta `json:"typeMeta"`
	ListMeta api.ListMeta    `json:"listMeta"`

	// Unordered list of custom resource definitions
	Items []CustomResourceObject `json:"items"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

func (r *CustomResourceObjectList) UnmarshalJSON(data []byte) error {
	tempStruct := &struct {
		metav1.TypeMeta `json:",inline"`
		Items           []CustomResourceObject `json:"items"`
	}{}

	err := json.Unmarshal(data, &tempStruct)
	if err != nil {
		return err
	}

	r.TypeMeta = tempStruct.TypeMeta
	r.Items = tempStruct.Items
	return nil
}

type CustomResourceDefinitionNames struct {
	// plural is the plural name of the resource to serve.
	// The custom resources are served under `/apis/<group>/<version>/.../<plural>`.
	// Must match the name of the CustomResourceDefinition (in the form `<names.plural>.<group>`).
	// Must be all lowercase.
	Plural string `json:"plural"`
	// singular is the singular name of the resource. It must be all lowercase. Defaults to lowercased `kind`.
	// +optional
	Singular string `json:"singular,omitempty"`
	// shortNames are short names for the resource, exposed in API discovery documents,
	// and used by clients to support invocations like `kubectl get <shortname>`.
	// It must be all lowercase.
	// +optional
	ShortNames []string `json:"shortNames,omitempty"`
	// kind is the serialized kind of the resource. It is normally CamelCase and singular.
	// Custom resource instances will use this value as the `kind` attribute in API calls.
	Kind string `json:"kind"`
	// listKind is the serialized kind of the list for this resource. Defaults to "`kind`List".
	// +optional
	ListKind string `json:"listKind,omitempty"`
	// categories is a list of grouped resources this custom resource belongs to (e.g. 'all').
	// This is published in API discovery documents, and used by clients to support invocations like
	// `kubectl get all`.
	// +optional
	Categories []string `json:"categories,omitempty"`
}
