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

package customresourcedefinition

import (
	"github.com/kubernetes/dashboard/src/app/backend/errors"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	apiextensions "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1beta1"
	apiextensionsclientset "k8s.io/apiextensions-apiserver/pkg/client/clientset/clientset"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/rest"
)

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

// GetCustomResourceDefinitionDetail returns detailed information about a custom resource definition.
func GetCustomResourceDefinitionDetail(client apiextensionsclientset.Interface, config *rest.Config, name string) (*CustomResourceDefinitionDetail, error) {
	customResourceDefinition, err := client.ApiextensionsV1beta1().
		CustomResourceDefinitions().
		Get(name, metav1.GetOptions{})
	nonCriticalErrors, criticalError := errors.HandleError(err)
	if criticalError != nil {
		return nil, criticalError
	}

	objects, err := GetCustomResourceObjectList(client, config, &common.NamespaceQuery{}, dataselect.DefaultDataSelect, name)
	nonCriticalErrors, criticalError = errors.AppendError(err, nonCriticalErrors)
	if criticalError != nil {
		return nil, criticalError
	}

	return toCustomResourceDefinitionDetail(customResourceDefinition, *objects, nonCriticalErrors), nil
}

func toCustomResourceDefinitionDetail(crd *apiextensions.CustomResourceDefinition, objects CustomResourceObjectList, nonCriticalErrors []error) *CustomResourceDefinitionDetail {
	subresources := []string{}
	if crd.Spec.Subresources != nil {
		if crd.Spec.Subresources.Scale != nil {
			subresources = append(subresources, "Scale")
		}
		if crd.Spec.Subresources.Status != nil {
			subresources = append(subresources, "Status")
		}
	}

	return &CustomResourceDefinitionDetail{
		CustomResourceDefinition: toCustomResourceDefinition(crd),
		Versions:                 getCRDVersions(crd),
		Conditions:               getCRDConditions(crd),
		Objects:                  objects,
		Subresources:             subresources,
		Errors:                   nonCriticalErrors,
	}
}

func getCRDVersions(crd *apiextensions.CustomResourceDefinition) []CustomResourceDefinitionVersion {
	crdVersions := make([]CustomResourceDefinitionVersion, 0, len(crd.Spec.Versions))
	if len(crd.Spec.Versions) > 0 {
		for _, version := range crd.Spec.Versions {
			crdVersions = append(crdVersions, CustomResourceDefinitionVersion{
				Name:    version.Name,
				Served:  version.Served,
				Storage: version.Storage,
			})
		}
	}

	return crdVersions
}
