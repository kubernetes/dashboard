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
	k8sClient "k8s.io/client-go/kubernetes"
	extensions "k8s.io/client-go/pkg/apis/extensions/v1beta1"
)

// ThirdPartyResource is a third party resource template.
type ThirdPartyResource struct {
	ObjectMeta common.ObjectMeta `json:"objectMeta"`
	TypeMeta   common.TypeMeta   `json:"typeMeta"`
}

// ThirdPartyResourceList contains a list of third party resource templates.
type ThirdPartyResourceList struct {
	ListMeta            common.ListMeta      `json:"listMeta"`
	TypeMeta            common.TypeMeta      `json:"typeMeta"`
	ThirdPartyResources []ThirdPartyResource `json:"thirdPartyResources"`
}

// GetThirdPartyResourceList returns a list of third party resource templates.
func GetThirdPartyResourceList(client k8sClient.Interface,
	dsQuery *dataselect.DataSelectQuery) (*ThirdPartyResourceList, error) {
	log.Println("Getting list of third party resources")

	channels := &common.ResourceChannels{
		ThirdPartyResourceList: common.GetThirdPartyResourceListChannel(client, 1),
	}

	return GetThirdPartyResourceListFromChannels(channels, dsQuery)
}

// GetThirdPartyResourceListFromChannels returns a list of all third party resources in the cluster
// reading required resource list once from the channels.
func GetThirdPartyResourceListFromChannels(channels *common.ResourceChannels,
	dsQuery *dataselect.DataSelectQuery) (*ThirdPartyResourceList, error) {

	tprs := <-channels.ThirdPartyResourceList.List
	if err := <-channels.ThirdPartyResourceList.Error; err != nil {
		return nil, err
	}

	result := getThirdPartyResourceList(tprs.Items, dsQuery)
	return result, nil
}

func getThirdPartyResourceList(thirdPartyResources []extensions.ThirdPartyResource,
	dsQuery *dataselect.DataSelectQuery) *ThirdPartyResourceList {
	result := &ThirdPartyResourceList{
		ThirdPartyResources: make([]ThirdPartyResource, 0),
		ListMeta:            common.ListMeta{TotalItems: len(thirdPartyResources)},
	}

	tprCells, filteredTotal := dataselect.GenericDataSelectWithFilter(toCells(thirdPartyResources), dsQuery)
	thirdPartyResources = fromCells(tprCells)
	result.ListMeta = common.ListMeta{TotalItems: filteredTotal}

	for _, item := range thirdPartyResources {
		result.ThirdPartyResources = append(result.ThirdPartyResources,
			ThirdPartyResource{
				ObjectMeta: common.NewObjectMeta(item.ObjectMeta),
				TypeMeta:   common.NewTypeMeta(common.ResourceKindThirdPartyResource),
			})
	}

	return result
}
