// Copyright 2015 Google Inc. All Rights Reserved.
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

package thirdpartyresource

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	k8sClient "k8s.io/client-go/kubernetes"
	extensions "k8s.io/client-go/pkg/apis/extensions/v1beta1"
	"k8s.io/client-go/rest"
)

// ThirdPartyResourceDetail is a third party resource template.
type ThirdPartyResourceDetail struct {
	ObjectMeta  common.ObjectMeta            `json:"objectMeta"`
	TypeMeta    common.TypeMeta              `json:"typeMeta"`
	Description string                       `json:"description"`
	Versions    []extensions.APIVersion      `json:"versions"`
	Objects     ThirdPartyResourceObjectList `json:"objects"`
}

// GetThirdPartyResourceDetail returns detailed information about a third party resource.
func GetThirdPartyResourceDetail(client k8sClient.Interface, config *rest.Config, name string) (*ThirdPartyResourceDetail, error) {
	log.Printf("Getting details of %s third party resource", name)

	thirdPartyResource, err := client.ExtensionsV1beta1().ThirdPartyResources().Get(name, metaV1.GetOptions{})
	if err != nil {
		return nil, err
	}

	objects, err := GetThirdPartyResourceObjects(client, config, dataselect.DefaultDataSelectWithMetrics, name)
	if err != nil {
		return nil, err
	}

	return getThirdPartyResourceDetail(thirdPartyResource, objects), nil
}

func getThirdPartyResourceDetail(thirdPartyResource *extensions.ThirdPartyResource, objects ThirdPartyResourceObjectList) *ThirdPartyResourceDetail {
	return &ThirdPartyResourceDetail{
		ObjectMeta:  common.NewObjectMeta(thirdPartyResource.ObjectMeta),
		TypeMeta:    common.NewTypeMeta(common.ResourceKindThirdPartyResource),
		Description: thirdPartyResource.Description,
		Versions:    thirdPartyResource.Versions,
		Objects:     objects,
	}
}
