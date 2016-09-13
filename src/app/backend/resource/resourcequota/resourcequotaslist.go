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

package resourcequota

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"k8s.io/kubernetes/pkg/api"
	client "k8s.io/kubernetes/pkg/client/unversioned"
)

// ResourceQuotaList contains a list of Resource Quotas in a cluster.
type ResourceQuotaList struct {
	ListMeta common.ListMeta `json : "listMeta"`
	// Unordered list of Rersource Quotas
	Items []ResourceQuota `json : "items"`
}

// ResourceQuota provides the simplified presentation layer view of Kubernetes
// Resource Quota resource.
type ResourceQuota struct {
	ObjectMeta common.ObjectMeta `json: "objectMeta"`
	TypeMeta   common.TypeMeta   `json : "typeMeta"`
}

// GetResourceQuotaList returns a list of all Resource Quotas in the cluster.
func GetResourceQuotaList(client *client.Client, nsQuery *common.NamespaceQuery,
	dsQuery *dataselect.DataSelectQuery) (*ResourceQuotaList, error) {
	log.Printf("Getting list resource quotas")
	channels := &common.ResourceChannels{
		ResourceQuotaList: common.GetResourceQuotaListChannel(client, nsQuery, 1),
	}
	return GetResourceQuotaListFromChannels(channels, nsQuery, dsQuery)
}

// GetResourceQuotaListFromChannels returns a list of all Resource Quotas in the cluster
// reading required resource list once from the channels.
func GetResourceQuotaListFromChannels(channels *common.ResourceChannels, nsQuery *common.NamespaceQuery,
	dsQuery *dataselect.DataSelectQuery) (*ResourceQuotaList, error) {

	resourceQuotas := <-channels.ResourceQuotaList.List
	if err := <-channels.ResourceQuotaList.Error; err != nil {
		return nil, err
	}

	result := getResourceQuotaList(resourceQuotas.Items, dsQuery)
	return result, nil
}

func getResourceQuotaList(resourceQuotas []api.ResourceQuota, dsQuery *dataselect.DataSelectQuery) *ResourceQuotaList {

	result := &ResourceQuotaList{
		Items:    make([]ResourceQuota, 0),
		ListMeta: common.ListMeta{TotalItems: len(resourceQuotas)},
	}

	resourceQuotas = fromCells(dataselect.GenericDataSelect(toCells(resourceQuotas), dsQuery))

	for _, item := range resourceQuotas {
		result.Items = append(result.Items,
			ResourceQuota{
				ObjectMeta: common.NewObjectMeta(item.ObjectMeta),
				TypeMeta:   common.NewTypeMeta(common.ResourceKindResourceQuota),
			})
	}

	return result
}
