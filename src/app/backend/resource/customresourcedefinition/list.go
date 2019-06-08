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
	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/errors"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	apiextensions "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1beta1"
	apiextensionsclientset "k8s.io/apiextensions-apiserver/pkg/client/clientset/clientset"
)

// CustomResourceDefinitionList contains a list of Custom Resource Definitions in the cluster.
type CustomResourceDefinitionList struct {
	ListMeta api.ListMeta `json:"listMeta"`

	// Unordered list of custom resource definitions
	Items []CustomResourceDefinition `json:"items"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

// GetCustomResourceDefinitionList returns all the custom resource definitions in the cluster.
func GetCustomResourceDefinitionList(client apiextensionsclientset.Interface, dsQuery *dataselect.DataSelectQuery) (*CustomResourceDefinitionList, error) {
	channel := common.GetCustomResourceDefinitionChannel(client, 1)
	crdList := <-channel.List
	err := <-channel.Error

	nonCriticalErrors, criticalError := errors.HandleError(err)
	if criticalError != nil {
		return nil, criticalError
	}

	return toCustomResourceDefinitionList(crdList.Items, nonCriticalErrors, dsQuery), nil
}

func toCustomResourceDefinitionList(crds []apiextensions.CustomResourceDefinition, nonCriticalErrors []error, dsQuery *dataselect.DataSelectQuery) *CustomResourceDefinitionList {
	crdList := &CustomResourceDefinitionList{
		Items:    make([]CustomResourceDefinition, 0),
		ListMeta: api.ListMeta{TotalItems: len(crds)},
		Errors:   nonCriticalErrors,
	}

	crdCells, filteredTotal := dataselect.GenericDataSelectWithFilter(toCells(crds), dsQuery)
	crds = fromCells(crdCells)
	crdList.ListMeta = api.ListMeta{TotalItems: filteredTotal}

	for _, crd := range crds {
		crdList.Items = append(crdList.Items, toCustomResourceDefinition(&crd))
	}

	return crdList
}

func toCustomResourceDefinition(crd *apiextensions.CustomResourceDefinition) CustomResourceDefinition {
	return CustomResourceDefinition{
		ObjectMeta: api.NewObjectMeta(crd.ObjectMeta),
		TypeMeta:   api.NewTypeMeta(api.ResourceKindCustomResourceDefinition),
		Version:    crd.Spec.Version,
	}
}
