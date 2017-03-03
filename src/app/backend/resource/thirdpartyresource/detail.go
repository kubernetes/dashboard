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
	"strings"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime/schema"
	k8sClient "k8s.io/client-go/kubernetes"
	extensions "k8s.io/client-go/pkg/apis/extensions/v1beta1"
	"k8s.io/client-go/tools/clientcmd"
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
func GetThirdPartyResourceDetail(client k8sClient.Interface, config clientcmd.ClientConfig, name string) (*ThirdPartyResourceDetail,
	error) {
	log.Printf("Getting details of %s third party resource", name)

	thirdPartyResource, err := client.Extensions().ThirdPartyResources().Get(name, metaV1.GetOptions{})
	if err != nil {
		return nil, err
	}

	return getThirdPartyResourceDetail(config, thirdPartyResource), nil
}

func getThirdPartyResourceDetail(config clientcmd.ClientConfig, thirdPartyResource *extensions.ThirdPartyResource) *ThirdPartyResourceDetail {
	return &ThirdPartyResourceDetail{
		ObjectMeta:  common.NewObjectMeta(thirdPartyResource.ObjectMeta),
		TypeMeta:    common.NewTypeMeta(common.ResourceKindThirdPartyResource),
		Description: thirdPartyResource.Description,
		Versions:    thirdPartyResource.Versions,
		Objects:     getThirdPartyResourceObjects(config, thirdPartyResource),
	}
}

// getThirdPartyResourceGroupVersion returns first group version of third party resource. It's also known as
// preferredVersion.
func getThirdPartyResourceGroupVersion(thirdPartyResource *extensions.ThirdPartyResource) schema.GroupVersion {
	version := ""
	if len(thirdPartyResource.Versions) > 0 {
		version = thirdPartyResource.Versions[0].Name
	}

	group := ""
	if strings.Contains(thirdPartyResource.ObjectMeta.Name, ".") {
		group = thirdPartyResource.ObjectMeta.Name[strings.Index(thirdPartyResource.ObjectMeta.Name, ".")+1:]
	} else {
		group = thirdPartyResource.ObjectMeta.Name
	}

	return schema.GroupVersion{
		Group:   group,
		Version: version,
	}
}

// getThirdPartyResourcePluralName returns third party resource object plural name, which can be used in API calls.
func getThirdPartyResourcePluralName(thirdPartyResource *extensions.ThirdPartyResource) string {
	name := strings.ToLower(thirdPartyResource.ObjectMeta.Name)

	if strings.Contains(name, "-") {
		name = strings.Replace(name, "-", "", 1)
	}

	if strings.Contains(name, ".") {
		name = name[:strings.Index(name, ".")]
	}

	return name + "s"
}
