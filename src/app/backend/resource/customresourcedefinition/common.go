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
	"fmt"

	apiextensionsv1 "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1"
	"k8s.io/apiextensions-apiserver/pkg/client/clientset/clientset"
	apiextensionsclientset "k8s.io/apiextensions-apiserver/pkg/client/clientset/clientset"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/apimachinery/pkg/runtime/serializer"
	"k8s.io/client-go/rest"

	"github.com/kubernetes/dashboard/src/app/backend/errors"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/customresourcedefinition/types"
	crdv1 "github.com/kubernetes/dashboard/src/app/backend/resource/customresourcedefinition/v1"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
)

var (
	groupName = apiextensionsv1.GroupName
	v1        = apiextensionsv1.SchemeGroupVersion.Version
)

func GetExtensionsAPIVersion(client clientset.Interface) (string, error) {
	list, err := client.Discovery().ServerGroups()
	if err != nil {
		return "", err
	}

	for _, group := range list.Groups {
		if group.Name == groupName {
			return group.PreferredVersion.Version, nil
		}
	}

	return "", errors.NewNotFound("supported version for extensions api not found")
}

func GetExtensionsAPIRestClient(client clientset.Interface) (rest.Interface, error) {
	version, err := GetExtensionsAPIVersion(client)
	if err != nil {
		return nil, err
	}

	switch version {
	case v1:
		return client.ApiextensionsV1().RESTClient(), nil
	}

	return nil, errors.NewNotFound(fmt.Sprintf("unsupported extensions api version: %s", version))
}

func GetCustomResourceDefinitionList(client apiextensionsclientset.Interface, dsQuery *dataselect.DataSelectQuery) (*types.CustomResourceDefinitionList, error) {
	version, err := GetExtensionsAPIVersion(client)
	if err != nil {
		return nil, err
	}

	switch version {
	case v1:
		return crdv1.GetCustomResourceDefinitionList(client, dsQuery)
	}

	return nil, errors.NewNotFound(fmt.Sprintf("unsupported extensions api version: %s", version))
}

func GetCustomResourceDefinitionDetail(client apiextensionsclientset.Interface, config *rest.Config, name string) (*types.CustomResourceDefinitionDetail, error) {
	version, err := GetExtensionsAPIVersion(client)
	if err != nil {
		return nil, err
	}

	switch version {
	case v1:
		return crdv1.GetCustomResourceDefinitionDetail(client, config, name)
	}

	return nil, errors.NewNotFound(fmt.Sprintf("unsupported extensions api versions: %s", version))
}

func GetCustomResourceObjectList(client apiextensionsclientset.Interface, config *rest.Config, namespace *common.NamespaceQuery,
	dsQuery *dataselect.DataSelectQuery, crdName string) (*types.CustomResourceObjectList, error) {
	version, err := GetExtensionsAPIVersion(client)
	if err != nil {
		return nil, err
	}

	switch version {
	case v1:
		return crdv1.GetCustomResourceObjectList(client, config, namespace, dsQuery, crdName)
	}

	return nil, errors.NewNotFound(fmt.Sprintf("unsupported extensions api versions: %s", version))
}

func GetCustomResourceObjectDetail(client apiextensionsclientset.Interface, namespace *common.NamespaceQuery, config *rest.Config, crdName string, name string) (*types.CustomResourceObjectDetail, error) {
	version, err := GetExtensionsAPIVersion(client)
	if err != nil {
		return nil, err
	}

	switch version {
	case v1:
		return crdv1.GetCustomResourceObjectDetail(client, namespace, config, crdName, name)
	}

	return nil, errors.NewNotFound(fmt.Sprintf("unsupported extensions api versions: %s", version))
}

func NewRESTClient(config *rest.Config, group, version string) (*rest.RESTClient, error) {
	groupVersion := schema.GroupVersion{
		Group:   group,
		Version: version,
	}

	scheme := runtime.NewScheme()
	schemeBuilder := runtime.NewSchemeBuilder(
		func(scheme *runtime.Scheme) error {
			scheme.AddKnownTypes(
				groupVersion,
				&metav1.ListOptions{},
				&metav1.DeleteOptions{},
			)
			return nil
		})
	if err := schemeBuilder.AddToScheme(scheme); err != nil {
		return nil, err
	}

	config.GroupVersion = &groupVersion
	config.APIPath = "/apis"
	config.ContentType = runtime.ContentTypeJSON
	config.NegotiatedSerializer = serializer.WithoutConversionCodecFactory{CodecFactory: serializer.NewCodecFactory(scheme)}

	return rest.RESTClientFor(config)
}
