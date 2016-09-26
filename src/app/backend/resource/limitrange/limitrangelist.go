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

package limitrange

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"k8s.io/kubernetes/pkg/api"
	client "k8s.io/kubernetes/pkg/client/unversioned"
)

// LimitRangeList contains a list of Limit Ranges in a cluster.
type LimitRangeList struct {
	ListMeta common.ListMeta `json:"listMeta"`
	// Unordered list of Limit Ranges
	Items []LimitRange `json:"items"`
}

// LimitRange provides the simplified presentation layer view of Kubernetes
// Limit Range resource.
type LimitRange struct {
	ObjectMeta common.ObjectMeta `json:"objectMeta"`
	TypeMeta   common.TypeMeta   `json:"typeMeta"`
}

// GetLimitRangeList returns a list of all Limit Ranges in the cluster.
func GetLimitRangeList(client *client.Client, nsQuery *common.NamespaceQuery,
	dsQuery *dataselect.DataSelectQuery) (*LimitRangeList, error) {
	log.Printf("Getting list limit ranges")
	channels := &common.ResourceChannels{
		LimitRangeList: common.GetLimitRangeListChannel(client, nsQuery, 1),
	}
	return GetLimitRangeListFromChannels(channels, nsQuery, dsQuery)
}

// GetLimitRangeListFromChannels returns a list of all Limit Ranges in the cluster
// reading required resource list once from the channels.
func GetLimitRangeListFromChannels(channels *common.ResourceChannels, nsQuery *common.NamespaceQuery,
	dsQuery *dataselect.DataSelectQuery) (*LimitRangeList, error) {

	limitRanges := <-channels.LimitRangeList.List
	if err := <-channels.LimitRangeList.Error; err != nil {
		return nil, err
	}

	result := getLimitRangeList(limitRanges.Items, dsQuery)
	return result, nil
}

func getLimitRangeList(limitRanges []api.LimitRange, dsQuery *dataselect.DataSelectQuery) *LimitRangeList {

	result := &LimitRangeList{
		Items:    make([]LimitRange, 0),
		ListMeta: common.ListMeta{TotalItems: len(limitRanges)},
	}

	limitRanges = fromCells(dataselect.GenericDataSelect(toCells(limitRanges), dsQuery))

	for _, item := range limitRanges {
		result.Items = append(result.Items,
			LimitRange{
				ObjectMeta: common.NewObjectMeta(item.ObjectMeta),
				TypeMeta:   common.NewTypeMeta(common.ResourceKindLimitRange),
			})
	}

	return result
}
