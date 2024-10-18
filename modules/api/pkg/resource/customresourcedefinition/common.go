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
	apiextensionsclientset "k8s.io/apiextensions-apiserver/pkg/client/clientset/clientset"
	"k8s.io/client-go/rest"

	"k8s.io/dashboard/api/pkg/resource/common"
	"k8s.io/dashboard/api/pkg/resource/customresourcedefinition/types"
	crdv1 "k8s.io/dashboard/api/pkg/resource/customresourcedefinition/v1"
	"k8s.io/dashboard/api/pkg/resource/dataselect"
	"k8s.io/dashboard/errors"
)

var (
	groupName = apiextensionsv1.GroupName
	v1        = apiextensionsv1.SchemeGroupVersion.Version
)

func GetExtensionsAPIVersion(client apiextensionsclientset.Interface) (string, error) {
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
