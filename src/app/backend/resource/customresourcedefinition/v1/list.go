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
	"k8s.io/apiextensions-apiserver/pkg/apis/apiextensions"
	apiextensionsv1 "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1"
	apiextensionsclientset "k8s.io/apiextensions-apiserver/pkg/client/clientset/clientset"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/errors"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/customresourcedefinition/types"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
)

// GetCustomResourceDefinitionList returns all the custom resource definitions in the cluster.
func GetCustomResourceDefinitionList(client apiextensionsclientset.Interface, dsQuery *dataselect.DataSelectQuery) (*types.CustomResourceDefinitionList, error) {
	channel := common.GetCustomResourceDefinitionChannelV1(client, 1)
	crdList := <-channel.List
	err := <-channel.Error

	nonCriticalErrors, criticalError := errors.HandleError(err)
	if criticalError != nil {
		return nil, criticalError
	}

	return toCustomResourceDefinitionList(crdList.Items, nonCriticalErrors, dsQuery), nil
}

func toCustomResourceDefinitionList(crds []apiextensionsv1.CustomResourceDefinition, nonCriticalErrors []error, dsQuery *dataselect.DataSelectQuery) *types.CustomResourceDefinitionList {
	crdList := &types.CustomResourceDefinitionList{
		Items:    make([]types.CustomResourceDefinition, 0),
		ListMeta: api.ListMeta{TotalItems: len(crds)},
		Errors:   nonCriticalErrors,
	}

	for i, crd := range crds {
		crds[i] = removeNonServedVersions(crd)
	}

	crdCells, filteredTotal := dataselect.GenericDataSelectWithFilter(toCells(crds), dsQuery)
	crds = fromCells(crdCells)
	crdList.ListMeta = api.ListMeta{TotalItems: filteredTotal}

	for _, crd := range crds {
		if !isServed(crd) {
			filteredTotal--
			crdList.ListMeta = api.ListMeta{TotalItems: filteredTotal}
			continue
		}

		crdList.Items = append(crdList.Items, toCustomResourceDefinition(&crd))
	}

	return crdList
}

func toCustomResourceDefinition(crd *apiextensionsv1.CustomResourceDefinition) types.CustomResourceDefinition {
	return types.CustomResourceDefinition{
		ObjectMeta:  api.NewObjectMeta(crd.ObjectMeta),
		TypeMeta:    api.NewTypeMeta(api.ResourceKindCustomResourceDefinition),
		Version:     crd.Spec.Versions[0].Name,
		Group:       crd.Spec.Group,
		Scope:       toCustomResourceDefinitionScope(crd.Spec.Scope),
		Names:       toCustomResourceDefinitionAcceptedNames(crd.Status.AcceptedNames),
		Established: getCRDConditionStatus(crd, apiextensionsv1.Established),
	}
}

func toCustomResourceDefinitionScope(scope apiextensionsv1.ResourceScope) apiextensions.ResourceScope {
	return apiextensions.ResourceScope(scope)
}

func toCustomResourceDefinitionAcceptedNames(names apiextensionsv1.CustomResourceDefinitionNames) types.CustomResourceDefinitionNames {
	return types.CustomResourceDefinitionNames{
		Plural:     names.Plural,
		Singular:   names.Singular,
		ShortNames: names.ShortNames,
		Kind:       names.Kind,
		ListKind:   names.ListKind,
		Categories: names.Categories,
	}
}

func getCRDConditionStatus(node *apiextensionsv1.CustomResourceDefinition, conditionType apiextensionsv1.CustomResourceDefinitionConditionType) apiextensions.ConditionStatus {
	for _, condition := range node.Status.Conditions {
		if condition.Type == conditionType {
			return apiextensions.ConditionStatus(condition.Status)
		}
	}
	return apiextensions.ConditionUnknown
}
