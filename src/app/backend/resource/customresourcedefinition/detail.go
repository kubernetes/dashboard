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
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	apiextensions "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1beta1"
	apiextensionsclientset "k8s.io/apiextensions-apiserver/pkg/client/clientset/clientset"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/rest"
)

type CustomResourceDefinitionDetail struct {
	CustomResourceDefinition `json:",inline"`
}

// CustomResourceDefinition represents a custom resource definition.
type CustomResourceDefinition struct {
	ObjectMeta api.ObjectMeta           `json:"objectMeta"`
	TypeMeta   api.TypeMeta             `json:"typeMeta"`
	Version    string                   `json:"version"`
	Objects    CustomResourceObjectList `json:"objects"`
}

// GetCustomResourceDefinitionDetail returns detailed information about a custom resource definition.
func GetCustomResourceDefinitionDetail(client apiextensionsclientset.Interface, config *rest.Config, name string) (*CustomResourceDefinitionDetail, error) {
	customResourceDefinition, err := client.ApiextensionsV1beta1().
		CustomResourceDefinitions().
		Get(name, metav1.GetOptions{})
	if err != nil {
		return nil, err
	}

	objects, err := GetCustomResourceObjectList(client, config, &common.NamespaceQuery{}, dataselect.DefaultDataSelect, name)
	if err != nil {
		return nil, err
	}

	return toCustomResourceDefinitionDetail(customResourceDefinition, objects), nil
}

func toCustomResourceDefinitionDetail(customResourceDefinition *apiextensions.CustomResourceDefinition, objects CustomResourceObjectList) *CustomResourceDefinitionDetail {
	return &CustomResourceDefinitionDetail{
		CustomResourceDefinition{
			ObjectMeta: api.NewObjectMeta(customResourceDefinition.ObjectMeta),
			TypeMeta:   api.NewTypeMeta(api.ResourceKindCustomResourceDefinition),
			Version:    customResourceDefinition.Spec.Version,
			Objects:    objects,
		},
	}
}
