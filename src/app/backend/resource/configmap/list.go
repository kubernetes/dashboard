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

package configmap

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	client "k8s.io/client-go/kubernetes"
	api "k8s.io/client-go/pkg/api/v1"
)

// ConfigMapList contains a list of Config Maps in the cluster.
type ConfigMapList struct {
	ListMeta common.ListMeta `json:"listMeta"`

	// Unordered list of Config Maps
	Items []ConfigMap `json:"items"`
}

// ConfigMap API resource provides mechanisms to inject containers with configuration data while keeping
// containers agnostic of Kubernetes
type ConfigMap struct {
	ObjectMeta common.ObjectMeta `json:"objectMeta"`
	TypeMeta   common.TypeMeta   `json:"typeMeta"`

	// No additional info in the list object.
}

// GetConfigMapList returns a list of all ConfigMaps in the cluster.
func GetConfigMapList(client *client.Clientset, nsQuery *common.NamespaceQuery,
	dsQuery *dataselect.DataSelectQuery) (*ConfigMapList, error) {
	log.Printf("Getting list config maps in the namespace %s", nsQuery.ToRequestParam())
	channels := &common.ResourceChannels{
		ConfigMapList: common.GetConfigMapListChannel(client, nsQuery, 1),
	}

	return GetConfigMapListFromChannels(channels, dsQuery)
}

// GetConfigMapListFromChannels returns a list of all Config Maps in the cluster
// reading required resource list once from the channels.
func GetConfigMapListFromChannels(channels *common.ResourceChannels, dsQuery *dataselect.DataSelectQuery) (
	*ConfigMapList, error) {

	configMaps := <-channels.ConfigMapList.List
	if err := <-channels.ConfigMapList.Error; err != nil {
		return nil, err
	}

	result := getConfigMapList(configMaps.Items, dsQuery)

	return result, nil
}

func getConfigMapList(configMaps []api.ConfigMap, dsQuery *dataselect.DataSelectQuery) *ConfigMapList {

	result := &ConfigMapList{
		Items:    make([]ConfigMap, 0),
		ListMeta: common.ListMeta{TotalItems: len(configMaps)},
	}

	configMapCells, filteredTotal := dataselect.GenericDataSelectWithFilter(toCells(configMaps), dsQuery)
	configMaps = fromCells(configMapCells)
	result.ListMeta = common.ListMeta{TotalItems: filteredTotal}

	for _, item := range configMaps {
		result.Items = append(result.Items,
			ConfigMap{
				ObjectMeta: common.NewObjectMeta(item.ObjectMeta),
				TypeMeta:   common.NewTypeMeta(common.ResourceKindConfigMap),
			})
	}

	return result
}
