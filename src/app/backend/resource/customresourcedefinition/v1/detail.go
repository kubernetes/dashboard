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
	"context"

	apiextensions "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1"
	apiextensionsclientset "k8s.io/apiextensions-apiserver/pkg/client/clientset/clientset"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/rest"

	"github.com/kubernetes/dashboard/src/app/backend/errors"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/customresourcedefinition/types"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
)

// GetCustomResourceDefinitionDetail returns detailed information about a custom resource definition.
func GetCustomResourceDefinitionDetail(client apiextensionsclientset.Interface, config *rest.Config, name string) (*types.CustomResourceDefinitionDetail, error) {
	customResourceDefinition, err := client.ApiextensionsV1().CustomResourceDefinitions().Get(context.TODO(), name, metav1.GetOptions{})
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

func toCustomResourceDefinitionDetail(crd *apiextensions.CustomResourceDefinition, objects types.CustomResourceObjectList, nonCriticalErrors []error) *types.CustomResourceDefinitionDetail {
	subresources := []string{}
	crdSubresources := crd.Spec.Versions[0].Subresources
	if crdSubresources != nil {
		if crdSubresources.Scale != nil {
			subresources = append(subresources, "Scale")
		}
		if crdSubresources.Status != nil {
			subresources = append(subresources, "Status")
		}
	}

	return &types.CustomResourceDefinitionDetail{
		CustomResourceDefinition: toCustomResourceDefinition(crd),
		Versions:                 getCRDVersions(crd),
		Conditions:               getCRDConditions(crd),
		Objects:                  objects,
		Subresources:             subresources,
		Errors:                   nonCriticalErrors,
	}
}

func getCRDVersions(crd *apiextensions.CustomResourceDefinition) []types.CustomResourceDefinitionVersion {
	crdVersions := make([]types.CustomResourceDefinitionVersion, 0, len(crd.Spec.Versions))
	if len(crd.Spec.Versions) > 0 {
		for _, version := range crd.Spec.Versions {
			crdVersions = append(crdVersions, types.CustomResourceDefinitionVersion{
				Name:    version.Name,
				Served:  version.Served,
				Storage: version.Storage,
			})
		}
	}

	return crdVersions
}
