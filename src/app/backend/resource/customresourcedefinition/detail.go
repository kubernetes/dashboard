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

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1beta1"
	apiextensionsclient "k8s.io/apiextensions-apiserver/pkg/client/clientset/clientset"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/rest"
)

// ThirdPartyResourceDetail is a third party resource template.
type CustomResourceDefinitionDetail struct {
	ObjectMeta  api.ObjectMeta                  `json:"objectMeta"`
	TypeMeta    api.TypeMeta                    `json:"typeMeta"`
	Description string                          `json:"description"`
	Versions    string                          `json:"version"`
	Objects     CustomResourceDefinitionObjList `json:"objects"`
}

// GetThirdPartyResourceDetail returns detailed information about a third party resource.
func GetCustomResourceDefinitionDetail(client apiextensionsclient.Interface, config *rest.Config, name string) (*CustomResourceDefinitionDetail, error) {
	log.Printf("Getting details of %s custom resource definition", name)

	customResourceDefinition, err := client.ApiextensionsV1beta1().CustomResourceDefinitions().Get(name, metaV1.GetOptions{})
	if err != nil {
		return nil, err
	}

	objects, err := GetCustomResourceDefinitionObjs(client, config, dataselect.DefaultDataSelectWithMetrics, name)
	if err != nil {
		return nil, err
	}

	return getCustomResourceDefinitionDetail(customResourceDefinition, objects), nil
}

func getCustomResourceDefinitionDetail(customResourceDefinition *v1beta1.CustomResourceDefinition, objects CustomResourceDefinitionObjList) *CustomResourceDefinitionDetail {
	return &CustomResourceDefinitionDetail{
		ObjectMeta:  api.NewObjectMeta(customResourceDefinition.ObjectMeta),
		TypeMeta:    api.NewTypeMeta(api.ResourceKindCustomResourceDefinition),
		Description: customResourceDefinition.Name,
		Versions:    customResourceDefinition.Spec.Version,
		Objects:     objects,
	}
}
