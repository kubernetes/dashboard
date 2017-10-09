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

package search

import (
	"github.com/kubernetes/dashboard/src/app/backend/errors"
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/cluster"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/config"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/discovery"
	"github.com/kubernetes/dashboard/src/app/backend/resource/workload"
	"k8s.io/client-go/kubernetes"
)

// SearchResult is a list of resources matching search criteria found in whole cluster.
type SearchResult struct {
	// Inherits fields from the cluster, config, discovery, and workloads objects.
	cluster.Cluster     `json:",inline"`
	config.Config       `json:",inline"`
	discovery.Discovery `json:",inline"`
	workload.Workloads  `json:",inline"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`

	// TODO(maciaszczykm): Add third party resources.
}

// Search returns a list of all objects matching search criteria (specified in namespace and data select queries).
func Search(client kubernetes.Interface, metricClient metricapi.MetricClient, nsQuery *common.NamespaceQuery,
	dsQuery *dataselect.DataSelectQuery) (*SearchResult, error) {

	clusterResources, err := cluster.GetCluster(client, dsQuery, metricClient)
	if err != nil {
		return &SearchResult{}, err
	}

	configResources, err := config.GetConfig(client, nsQuery, dsQuery)
	if err != nil {
		return &SearchResult{}, err
	}

	discoveryResources, err := discovery.GetDiscovery(client, nsQuery, dsQuery)
	if err != nil {
		return &SearchResult{}, err
	}

	workloadsResources, err := workload.GetWorkloads(client, metricClient, nsQuery, dsQuery)
	if err != nil {
		return &SearchResult{}, err
	}

	return &SearchResult{
		Cluster: cluster.Cluster{
			NamespaceList:        clusterResources.NamespaceList,
			NodeList:             clusterResources.NodeList,
			PersistentVolumeList: clusterResources.PersistentVolumeList,
			RoleList:             clusterResources.RoleList,
			StorageClassList:     clusterResources.StorageClassList,
		},

		Config: config.Config{
			ConfigMapList:             configResources.ConfigMapList,
			PersistentVolumeClaimList: configResources.PersistentVolumeClaimList,
			SecretList:                configResources.SecretList,
		},

		Discovery: discovery.Discovery{
			ServiceList: discoveryResources.ServiceList,
			IngressList: discoveryResources.IngressList,
		},

		Workloads: workload.Workloads{
			DeploymentList:            workloadsResources.DeploymentList,
			ReplicaSetList:            workloadsResources.ReplicaSetList,
			JobList:                   workloadsResources.JobList,
			ReplicationControllerList: workloadsResources.ReplicationControllerList,
			PodList:                   workloadsResources.PodList,
			DaemonSetList:             workloadsResources.DaemonSetList,
			StatefulSetList:           workloadsResources.StatefulSetList,
		},

		Errors: errors.MergeErrors(clusterResources.Errors, configResources.Errors,
			discoveryResources.Errors, workloadsResources.Errors),
	}, nil
}
