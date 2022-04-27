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
	"encoding/json"
	"fmt"

	apiextensionsv1 "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1"
	apiextensionsclientset "k8s.io/apiextensions-apiserver/pkg/client/clientset/clientset"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/rest"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/errors"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/customresourcedefinition/types"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
)

// GetCustomResourceObjectList gets objects for a CR.
func GetCustomResourceObjectList(client apiextensionsclientset.Interface, config *rest.Config, namespace *common.NamespaceQuery,
	dsQuery *dataselect.DataSelectQuery, crdName string) (*types.CustomResourceObjectList, error) {
	var list *types.CustomResourceObjectList

	customResourceDefinition, err := client.ApiextensionsV1().
		CustomResourceDefinitions().
		Get(context.TODO(), crdName, metav1.GetOptions{})
	nonCriticalErrors, criticalError := errors.HandleError(err)
	if criticalError != nil {
		return nil, criticalError
	}

	customResourceDefinition = &[]apiextensionsv1.CustomResourceDefinition{removeNonServedVersions(*customResourceDefinition)}[0]

	if !isServed(*customResourceDefinition) {
		return nil, errors.NewNotFound(fmt.Sprintf("could not find any served versions for the requested resource (%s)", customResourceDefinition.Name))
	}

	restClient, err := NewRESTClient(config, customResourceDefinition)
	nonCriticalErrors, criticalError = errors.AppendError(err, nonCriticalErrors)
	if criticalError != nil {
		return nil, criticalError
	}

	raw, err := restClient.Get().
		NamespaceIfScoped(namespace.ToRequestParam(), customResourceDefinition.Spec.Scope == apiextensionsv1.NamespaceScoped).
		Resource(customResourceDefinition.Spec.Names.Plural).
		Do(context.TODO()).Raw()
	nonCriticalErrors, criticalError = errors.AppendError(err, nonCriticalErrors)
	if criticalError != nil {
		return nil, criticalError
	}

	err = json.Unmarshal(raw, &list)
	nonCriticalErrors, criticalError = errors.AppendError(err, nonCriticalErrors)
	if criticalError != nil {
		return nil, criticalError
	}
	list.Errors = nonCriticalErrors

	// Return only slice of data, pagination is done here.
	crdObjectCells, filteredTotal := dataselect.GenericDataSelectWithFilter(toObjectCells(list.Items), dsQuery)
	list.Items = fromObjectCells(crdObjectCells)
	list.ListMeta = api.ListMeta{TotalItems: filteredTotal}

	for i := range list.Items {
		toCRDObject(&list.Items[i], customResourceDefinition)
	}

	return list, nil
}

// GetCustomResourceObjectDetail returns details of a single object in a CR.
func GetCustomResourceObjectDetail(client apiextensionsclientset.Interface, namespace *common.NamespaceQuery, config *rest.Config, crdName string, name string) (*types.CustomResourceObjectDetail, error) {
	var detail *types.CustomResourceObjectDetail

	customResourceDefinition, err := client.ApiextensionsV1().
		CustomResourceDefinitions().
		Get(context.TODO(), crdName, metav1.GetOptions{})
	nonCriticalErrors, criticalError := errors.HandleError(err)
	if criticalError != nil {
		return nil, criticalError
	}

	restClient, err := NewRESTClient(config, customResourceDefinition)
	nonCriticalErrors, criticalError = errors.AppendError(err, nonCriticalErrors)
	if criticalError != nil {
		return nil, criticalError
	}

	raw, err := restClient.Get().
		NamespaceIfScoped(namespace.ToRequestParam(), customResourceDefinition.Spec.Scope == apiextensionsv1.NamespaceScoped).
		Resource(customResourceDefinition.Spec.Names.Plural).
		Name(name).Do(context.TODO()).Raw()
	nonCriticalErrors, criticalError = errors.AppendError(err, nonCriticalErrors)
	if criticalError != nil {
		return nil, criticalError
	}

	err = json.Unmarshal(raw, &detail)
	nonCriticalErrors, criticalError = errors.AppendError(err, nonCriticalErrors)
	if criticalError != nil {
		return nil, criticalError
	}
	detail.Errors = nonCriticalErrors

	toCRDObject(&detail.CustomResourceObject, customResourceDefinition)
	return detail, nil
}

// toCRDObject sets the object kind to the full name of the CRD.
// E.g. changes "Foo" to "foos.samplecontroller.k8s.io"
func toCRDObject(object *types.CustomResourceObject, crd *apiextensionsv1.CustomResourceDefinition) {
	object.TypeMeta.Kind = api.ResourceKind(crd.Name)
	crdSubresources := crd.Spec.Versions[0].Subresources
	object.TypeMeta.Scalable = crdSubresources != nil && crdSubresources.Scale != nil
}
