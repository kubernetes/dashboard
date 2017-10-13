// Copyright 2017 The Kubernetes Dashboard Authors.
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
	"log"
	"strings"

	"encoding/json"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/errors"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1beta1"
	apiextensionsclient "k8s.io/apiextensions-apiserver/pkg/client/clientset/clientset"
	apiv1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/rest"
)

func ListCustomResourceDefinition(clientset apiextensionsclient.Interface, dsQuery *dataselect.DataSelectQuery) (
	*CustomResourceDefinitionList, error) {
	log.Println("Getting list of Custom Resource Definition")

	channels := &common.ResourceChannels{
		CustomResourceDefinitionList: common.GetCustomResourceDefinitionListChannel(clientset, 1),
	}

	return GetCustomResourceDefinitionListFromChannels(channels, dsQuery)
}

// ThirdPartyResourceObject is a single instance of third party resource.
type CustomResourceDefinitionObj struct {
	metav1.TypeMeta `json:",inline"`
	Metadata        metav1.ObjectMeta `json:"metadata,omitempty"`
}

func (in *CustomResourceDefinitionObj) DeepCopyObject() runtime.Object {
	if c := in.DeepCopy(); c != nil {
		return c
	} else {
		return nil
	}
}

func (in *CustomResourceDefinitionObj) DeepCopy() *CustomResourceDefinitionObj {
	if in == nil {
		return nil
	}
	out := new(CustomResourceDefinitionObj)
	*out = *in
	return out
}

// ThirdPartyResourceObjectList is a list of third party resource instances.
type CustomResourceDefinitionObjList struct {
	ListMeta        api.ListMeta `json:"listMeta"`
	metav1.TypeMeta `json:",inline"`

	Items []CustomResourceDefinitionObj `json:"items"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

func (in *CustomResourceDefinitionObjList) DeepCopyObject() runtime.Object {
	if c := in.DeepCopy(); c != nil {
		return c
	} else {
		return nil
	}
}

func (in *CustomResourceDefinitionObjList) DeepCopy() *CustomResourceDefinitionObjList {
	if in == nil {
		return nil
	}
	out := new(CustomResourceDefinitionObjList)
	*out = *in
	return out
}

// GetCustomResourceDefinitionObjs return list of third party resource instances. Channels cannot be
// used here yet, because we operate on raw JSONs.
func GetCustomResourceDefinitionObjs(client apiextensionsclient.Interface, config *rest.Config,
	dsQuery *dataselect.DataSelectQuery, crdName string) (CustomResourceDefinitionObjList, error) {

	log.Printf("Getting Custom Resource Definition Objects %s objects", crdName)
	list := CustomResourceDefinitionObjList{}

	customResourceDefinition, err := client.ApiextensionsV1beta1().CustomResourceDefinitions().Get(crdName, metaV1.GetOptions{})
	nonCriticalErrors, criticalError := errors.HandleError(err)
	if criticalError != nil {
		return list, criticalError
	}
	restClient, err := newRESTClient(config, getCustomResourceDefinitionGroupVersion(customResourceDefinition))
	if err != nil {
		return list, err
	}

	raw, err := restClient.Get().Resource(customResourceDefinition.Spec.Names.Plural).Namespace(apiv1.NamespaceAll).Do().Raw()
	nonCriticalErrors, criticalError = errors.AppendError(err, nonCriticalErrors)
	if criticalError != nil {
		return list, criticalError
	}
	// Unmarshal raw data to JSON.
	err = json.Unmarshal(raw, &list)

	// Return only slice of data, pagination is done here.
	tprObjectCells, filteredTotal := dataselect.GenericDataSelectWithFilter(toObjectCells(list.Items), dsQuery)
	list.Items = fromObjectCells(tprObjectCells)
	list.ListMeta = api.ListMeta{TotalItems: filteredTotal}
	list.Errors = nonCriticalErrors

	return list, err
}

// getCustomResourceDefinitionGroupVersion returns first group version of third party resource.
// It's also known as preferredVersion.
func getCustomResourceDefinitionGroupVersion(crd *v1beta1.CustomResourceDefinition) schema.GroupVersion {
	version := crd.Spec.Version
	group := ""
	if strings.Contains(crd.ObjectMeta.Name, ".") {
		group = crd.ObjectMeta.Name[strings.Index(crd.ObjectMeta.Name, ".")+1:]
	} else {
		group = crd.ObjectMeta.Name
	}

	return schema.GroupVersion{
		Group:   group,
		Version: version,
	}
}
