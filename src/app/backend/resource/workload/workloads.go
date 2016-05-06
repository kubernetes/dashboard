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

package workload

import (
	"log"

	"github.com/kubernetes/dashboard/resource/common"
	"github.com/kubernetes/dashboard/resource/deployment"
	"github.com/kubernetes/dashboard/resource/replicaset"
	"github.com/kubernetes/dashboard/resource/replicationcontroller"
	client "k8s.io/kubernetes/pkg/client/unversioned"
)

// Workloads stucture contains all resource lists grouped into the workloads category.
type Workloads struct {
	DeploymentList deployment.DeploymentList `json:"deploymentList"`

	ReplicaSetList replicaset.ReplicaSetList `json:"replicaSetList"`

	ReplicationControllerList replicationcontroller.ReplicationControllerList `json:"replicationControllerList"`
}

// GetWorkloads returns a list of all workloads in the cluster.
func GetWorkloads(client client.Interface) (*Workloads, error) {
	log.Printf("Getting lists of all workloads")
	channels := &common.ResourceChannels{
		ReplicationControllerList: common.GetReplicationControllerListChannel(client, 1),
		ReplicaSetList:            common.GetReplicaSetListChannel(client.Extensions(), 1),
		DeploymentList:            common.GetDeploymentListChannel(client.Extensions(), 1),
		ServiceList:               common.GetServiceListChannel(client, 3),
		PodList:                   common.GetPodListChannel(client, 3),
		EventList:                 common.GetEventListChannel(client, 3),
		NodeList:                  common.GetNodeListChannel(client, 3),
	}

	return GetWorkloadsFromChannels(channels)
}

// GetWorkloadsFromChannels returns a list of all workloads in the cluster, from the
// channel sources.
func GetWorkloadsFromChannels(channels *common.ResourceChannels) (*Workloads, error) {
	rsChan := make(chan *replicaset.ReplicaSetList)
	deploymentChan := make(chan *deployment.DeploymentList)
	rcChan := make(chan *replicationcontroller.ReplicationControllerList)
	errChan := make(chan error, 3)

	go func() {
		rcList, err := replicationcontroller.GetReplicationControllerListFromChannels(channels)
		errChan <- err
		rcChan <- rcList
	}()

	go func() {
		rsList, err := replicaset.GetReplicaSetListFromChannels(channels)
		errChan <- err
		rsChan <- rsList
	}()

	go func() {
		deploymentList, err := deployment.GetDeploymentListFromChannels(channels)
		errChan <- err
		deploymentChan <- deploymentList
	}()

	rcList := <-rcChan
	err := <-errChan
	if err != nil {
		return nil, err
	}

	rsList := <-rsChan
	err = <-errChan
	if err != nil {
		return nil, err
	}

	deploymentList := <-deploymentChan
	err = <-errChan
	if err != nil {
		return nil, err
	}

	workloads := &Workloads{
		ReplicaSetList:            *rsList,
		ReplicationControllerList: *rcList,
		DeploymentList:            *deploymentList,
	}

	return workloads, nil
}
