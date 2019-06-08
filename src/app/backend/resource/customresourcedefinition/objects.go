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
	apiextensionsclientset "k8s.io/apiextensions-apiserver/pkg/client/clientset/clientset"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/client-go/rest"
)

type CustomResourceObjectDetail struct {
	CustomResourceObject `json:",inline"`
}

// CustomResourceObject represents a custom resource object.
type CustomResourceObject struct {
	metav1.TypeMeta `json:",inline"`
	Metadata        metav1.ObjectMeta `json:"metadata,omitempty"`
}

func (in *CustomResourceObject) DeepCopyObject() runtime.Object {
	if c := in.DeepCopy(); c != nil {
		return c
	} else {
		return nil
	}
}

func (in *CustomResourceObject) DeepCopy() *CustomResourceObject {
	if in == nil {
		return nil
	}
	out := new(CustomResourceObject)
	*out = *in
	return out
}

// CustomResourceObjectList represents crd objects in a namespace.
type CustomResourceObjectList struct {
	ListMeta        api.ListMeta `json:"listMeta"`
	metav1.TypeMeta `json:",inline"`

	// Unordered list of custom resource definitions
	Items []CustomResourceObject `json:"items"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

func (in *CustomResourceObjectList) DeepCopyObject() runtime.Object {
	if c := in.DeepCopy(); c != nil {
		return c
	} else {
		return nil
	}
}

func (in *CustomResourceObjectList) DeepCopy() *CustomResourceObjectList {
	if in == nil {
		return nil
	}
	out := new(CustomResourceObjectList)
	*out = *in
	return out
}

// GetCustomResourceObjectList gets objects for a CR.
func GetCustomResourceObjectList(client apiextensionsclientset.Interface, config *rest.Config, namespace *common.NamespaceQuery,
	dsQuery *dataselect.DataSelectQuery, crdName string) (CustomResourceObjectList, error) {
	var list CustomResourceObjectList

	customResourceDefinition, err := client.ApiextensionsV1beta1().
		CustomResourceDefinitions().
		Get(crdName, metav1.GetOptions{})
	nonCriticalErrors, criticalError := errors.HandleError(err)
	if criticalError != nil {
		return list, criticalError
	}

	restClient, err := newRESTClient(config, getCustomResourceDefinitionGroupVersion(customResourceDefinition))
	nonCriticalErrors, criticalError = errors.AppendError(err, nonCriticalErrors)
	if criticalError != nil {
		return list, criticalError
	}

	err = restClient.Get().
		Namespace(namespace.ToRequestParam()).
		Resource(customResourceDefinition.Spec.Names.Plural).
		Do().Into(&list)
	nonCriticalErrors, criticalError = errors.AppendError(err, nonCriticalErrors)
	if criticalError != nil {
		return list, criticalError
	}

	// Return only slice of data, pagination is done here.
	crdObjectCells, filteredTotal := dataselect.GenericDataSelectWithFilter(toObjectCells(list.Items), dsQuery)
	list.Items = fromObjectCells(crdObjectCells)
	list.ListMeta = api.ListMeta{TotalItems: filteredTotal}
	list.Errors = nonCriticalErrors

	return list, nil
}

// GetCustomResourceObjectDetail returns details of a single object in a CR.
func GetCustomResourceObjectDetail(client apiextensionsclientset.Interface, namespace *common.NamespaceQuery, config *rest.Config, crdName string, name string) (CustomResourceObjectDetail, error) {
	var detail CustomResourceObjectDetail

	customResourceDefinition, err := client.ApiextensionsV1beta1().
		CustomResourceDefinitions().
		Get(crdName, metav1.GetOptions{})
	if err != nil {
		return detail, err
	}

	restClient, err := newRESTClient(config, getCustomResourceDefinitionGroupVersion(customResourceDefinition))
	if err != nil {
		return detail, err
	}

	err = restClient.Get().
		Namespace(namespace.ToRequestParam()).
		Resource(customResourceDefinition.Spec.Names.Plural).
		Name(name).Do().Into(&detail)
	if err != nil {
		return detail, err
	}

	return detail, nil
}
