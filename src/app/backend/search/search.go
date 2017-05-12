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

package search

import (
	"github.com/kubernetes/dashboard/src/app/backend/client"
	"github.com/kubernetes/dashboard/src/app/backend/resource/cluster"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/config"
	"github.com/kubernetes/dashboard/src/app/backend/resource/configmap"
	"github.com/kubernetes/dashboard/src/app/backend/resource/daemonset"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/deployment"
	"github.com/kubernetes/dashboard/src/app/backend/resource/discovery"
	"github.com/kubernetes/dashboard/src/app/backend/resource/ingress"
	"github.com/kubernetes/dashboard/src/app/backend/resource/job"
	"github.com/kubernetes/dashboard/src/app/backend/resource/namespace"
	"github.com/kubernetes/dashboard/src/app/backend/resource/node"
	"github.com/kubernetes/dashboard/src/app/backend/resource/persistentvolume"
	pvc "github.com/kubernetes/dashboard/src/app/backend/resource/persistentvolumeclaim"
	"github.com/kubernetes/dashboard/src/app/backend/resource/pod"
	"github.com/kubernetes/dashboard/src/app/backend/resource/rbacroles"
	"github.com/kubernetes/dashboard/src/app/backend/resource/replicaset"
	rc "github.com/kubernetes/dashboard/src/app/backend/resource/replicationcontroller"
	"github.com/kubernetes/dashboard/src/app/backend/resource/secret"
	"github.com/kubernetes/dashboard/src/app/backend/resource/service"
	"github.com/kubernetes/dashboard/src/app/backend/resource/statefulset"
	"github.com/kubernetes/dashboard/src/app/backend/resource/storageclass"
	"github.com/kubernetes/dashboard/src/app/backend/resource/workload"
	"k8s.io/client-go/kubernetes"
)

// SearchResult is a list of resources matching search criteria found in whole cluster.
type SearchResult struct {

	// Cluster.
	NamespaceList        namespace.NamespaceList               `json:"namespaceList"`
	NodeList             node.NodeList                         `json:"nodeList"`
	PersistentVolumeList persistentvolume.PersistentVolumeList `json:"persistentVolumeList"`
	RoleList             rbacroles.RbacRoleList                `json:"roleList"`
	StorageClassList     storageclass.StorageClassList         `json:"storageClassList"`

	// Config and storage.
	ConfigMapList             configmap.ConfigMapList       `json:"configMapList"`
	PersistentVolumeClaimList pvc.PersistentVolumeClaimList `json:"persistentVolumeClaimList"`
	SecretList                secret.SecretList             `json:"secretList"`

	// Discovery and load balancing.
	ServiceList service.ServiceList `json:"serviceList"`
	IngressList ingress.IngressList `json:"ingressList"`

	// Workloads.
	DeploymentList            deployment.DeploymentList    `json:"deploymentList"`
	ReplicaSetList            replicaset.ReplicaSetList    `json:"replicaSetList"`
	JobList                   job.JobList                  `json:"jobList"`
	ReplicationControllerList rc.ReplicationControllerList `json:"replicationControllerList"`
	PodList                   pod.PodList                  `json:"podList"`
	DaemonSetList             daemonset.DaemonSetList      `json:"daemonSetList"`
	StatefulSetList           statefulset.StatefulSetList  `json:"statefulSetList"`

	// TODO(maciaszczykm): Third party resources.
}

func Search(client *kubernetes.Clientset, heapsterClient client.HeapsterClient, nsQuery *common.NamespaceQuery,
	dsQuery *dataselect.DataSelectQuery) (*SearchResult, error) {

	clusterResources, err := cluster.GetCluster(client, dsQuery, &heapsterClient)
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

	workloadsResources, err := workload.GetWorkloads(client, heapsterClient, nsQuery, dsQuery)
	if err != nil {
		return &SearchResult{}, err
	}

	return &SearchResult{

		// Cluster.
		NamespaceList:        clusterResources.NamespaceList,
		NodeList:             clusterResources.NodeList,
		PersistentVolumeList: clusterResources.PersistentVolumeList,
		RoleList:             clusterResources.RoleList,
		StorageClassList:     clusterResources.StorageClassList,

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
	}, nil
}
