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
	"k8s.io/kubernetes/pkg/apis/extensions"
	client "k8s.io/kubernetes/pkg/client/clientset_generated/internalclientset"
)

// ThirdPartyResourceDetail is a third party resource template. Used in detail view.
type ThirdPartyResourceDetail struct {
	ObjectMeta  common.ObjectMeta       `json:"objectMeta"`
	TypeMeta    common.TypeMeta         `json:"typeMeta"`
	Description string                  `json:"description"`
	Versions    []extensions.APIVersion `json:"versions"`
}

// GetThirdPartyResourceDetail returns detailed information about a third party resource.
func GetThirdPartyResourceDetail(client *client.Clientset, name string) (*ThirdPartyResourceDetail,
	error) {
	log.Printf("Getting details of %s third party resource", name)

	thirdPartyResource, err := client.ThirdPartyResources().Get(name)
	if err != nil {
		return nil, err
	}

	return getThirdPartyResourceDetail(thirdPartyResource), nil
}

func getThirdPartyResourceDetail(thirdPartyResource *extensions.ThirdPartyResource) *ThirdPartyResourceDetail {
	return &ThirdPartyResourceDetail{
		ObjectMeta:  common.NewObjectMeta(thirdPartyResource.ObjectMeta),
		TypeMeta:    common.NewTypeMeta(common.ResourceKindThirdPartyResource),
		Description: thirdPartyResource.Description,
		Versions:    thirdPartyResource.Versions,
	}
}
