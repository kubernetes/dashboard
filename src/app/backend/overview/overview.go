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

package overview

import (
	"github.com/kubernetes/dashboard/src/app/backend/errors"
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/config"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/discovery"
	"github.com/kubernetes/dashboard/src/app/backend/resource/workload"
	"github.com/kubernetes/dashboard/src/app/backend/search"
	"k8s.io/client-go/kubernetes"
)

// OverviewObjectList is a list of objects present in a given namespace
type OverviewObjectList struct {
	search.ResourcesInNamespace

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

// GetOverview returns a list of all objects in a given namespace.
func GetOverview(client *kubernetes.Clientset, metricClient metricapi.MetricClient,
	nsQuery *common.NamespaceQuery,
	dsQuery *dataselect.DataSelectQuery) (*OverviewObjectList, error) {

	configResources, err := config.GetConfig(client, nsQuery, dsQuery)
	if err != nil {
		return &OverviewObjectList{}, err
	}

	discoveryResources, err := discovery.GetDiscovery(client, nsQuery, dsQuery)
	if err != nil {
		return &OverviewObjectList{}, err
	}

	workloadsResources, err := workload.GetWorkloads(client, metricClient, nsQuery, dsQuery)
	if err != nil {
		return &OverviewObjectList{}, err
	}

	return &OverviewObjectList{
		// All the objects in a namespace
		ResourcesInNamespace: search.ResourcesInNamespace{
			// Config and storage.
			ConfigMapList:             configResources.ConfigMapList,
			PersistentVolumeClaimList: configResources.PersistentVolumeClaimList,
			SecretList:                configResources.SecretList,

			// Discovery and load balancing.
			ServiceList: discoveryResources.ServiceList,
			IngressList: discoveryResources.IngressList,

			// Workloads.
			DeploymentList:            workloadsResources.DeploymentList,
			ReplicaSetList:            workloadsResources.ReplicaSetList,
			JobList:                   workloadsResources.JobList,
			ReplicationControllerList: workloadsResources.ReplicationControllerList,
			PodList:                   workloadsResources.PodList,
			DaemonSetList:             workloadsResources.DaemonSetList,
			StatefulSetList:           workloadsResources.StatefulSetList,
		},

		// Errors.
		Errors: errors.MergeErrors(configResources.Errors, discoveryResources.Errors,
			workloadsResources.Errors),
	}, nil
}
