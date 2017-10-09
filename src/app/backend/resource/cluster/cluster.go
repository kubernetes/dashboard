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

package cluster

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/errors"
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/namespace"
	"github.com/kubernetes/dashboard/src/app/backend/resource/node"
	pv "github.com/kubernetes/dashboard/src/app/backend/resource/persistentvolume"
	"github.com/kubernetes/dashboard/src/app/backend/resource/rbacroles"
	"github.com/kubernetes/dashboard/src/app/backend/resource/storageclass"
	"k8s.io/client-go/kubernetes"
)

// Cluster structure contains all resource lists grouped into the cluster category.
type Cluster struct {
	NamespaceList        namespace.NamespaceList       `json:"namespaceList"`
	NodeList             node.NodeList                 `json:"nodeList"`
	PersistentVolumeList pv.PersistentVolumeList       `json:"persistentVolumeList"`
	RoleList             rbacroles.RbacRoleList        `json:"roleList"`
	StorageClassList     storageclass.StorageClassList `json:"storageClassList"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

// GetCluster returns a list of all cluster resources in the cluster.
func GetCluster(client kubernetes.Interface, dsQuery *dataselect.DataSelectQuery,
	metricClient metricapi.MetricClient) (*Cluster, error) {

	log.Print("Getting cluster category")
	channels := &common.ResourceChannels{
		NamespaceList:        common.GetNamespaceListChannel(client, 1),
		NodeList:             common.GetNodeListChannel(client, 1),
		PersistentVolumeList: common.GetPersistentVolumeListChannel(client, 1),
		RoleList:             common.GetRoleListChannel(client, 1),
		ClusterRoleList:      common.GetClusterRoleListChannel(client, 1),
		StorageClassList:     common.GetStorageClassListChannel(client, 1),
	}

	return GetClusterFromChannels(client, channels, dsQuery, metricClient)
}

// GetClusterFromChannels returns a list of all cluster in the cluster, from the channel sources.
func GetClusterFromChannels(client kubernetes.Interface, channels *common.ResourceChannels,
	dsQuery *dataselect.DataSelectQuery, metricClient metricapi.MetricClient) (*Cluster, error) {

	numErrs := 5
	errChan := make(chan error, numErrs)
	nsChan := make(chan *namespace.NamespaceList)
	nodeChan := make(chan *node.NodeList)
	pvChan := make(chan *pv.PersistentVolumeList)
	roleChan := make(chan *rbacroles.RbacRoleList)
	storageChan := make(chan *storageclass.StorageClassList)

	go func() {
		items, err := namespace.GetNamespaceListFromChannels(channels, dsQuery)
		errChan <- err
		nsChan <- items
	}()

	go func() {
		items, err := node.GetNodeListFromChannels(client, channels,
			dataselect.NewDataSelectQuery(dsQuery.PaginationQuery, dsQuery.SortQuery,
				dsQuery.FilterQuery, dataselect.StandardMetrics), metricClient)
		errChan <- err
		nodeChan <- items
	}()

	go func() {
		items, err := pv.GetPersistentVolumeListFromChannels(channels, dsQuery)
		errChan <- err
		pvChan <- items
	}()

	go func() {
		items, err := rbacroles.GetRbacRoleListFromChannels(channels, dsQuery)
		errChan <- err
		roleChan <- items
	}()

	go func() {
		items, err := storageclass.GetStorageClassListFromChannels(channels, dsQuery)
		errChan <- err
		storageChan <- items
	}()

	for i := 0; i < numErrs; i++ {
		err := <-errChan
		if err != nil {
			return nil, err
		}
	}

	cluster := &Cluster{
		NamespaceList:        *(<-nsChan),
		NodeList:             *(<-nodeChan),
		PersistentVolumeList: *(<-pvChan),
		RoleList:             *(<-roleChan),
		StorageClassList:     *(<-storageChan),
	}

	cluster.Errors = errors.MergeErrors(cluster.NamespaceList.Errors, cluster.NodeList.Errors,
		cluster.PersistentVolumeList.Errors, cluster.RoleList.Errors, cluster.StorageClassList.Errors)

	return cluster, nil
}
