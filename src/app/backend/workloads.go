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

package main

import (
	"log"

	client "k8s.io/kubernetes/pkg/client/unversioned"
)

// Workloads stucture contains all resource lists grouped into the workloads category.
type Workloads struct {
	ReplicaSetList ReplicaSetList `json:"replicaSetList"`

	ReplicationControllerList ReplicationControllerList `json:"replicationControllerList"`
}

// GetWorkloads returns a list of all workloads in the cluster.
func GetWorkloads(client client.Interface) (*Workloads, error) {
	log.Printf("Getting lists of all workloads")
	channels := &ResourceChannels{
		ReplicationControllerList: getReplicationControllerListChannel(client, 1),
		ReplicaSetList:            getReplicaSetListChannel(client.Extensions(), 1),
		ServiceList:               getServiceListChannel(client, 2),
		PodList:                   getPodListChannel(client, 2),
		EventList:                 getEventListChannel(client, 2),
		NodeList:                  getNodeListChannel(client, 2),
	}

	return GetWorkloadsFromChannels(channels)
}

// GetWorkloadsFromChannels returns a list of all workloads in the cluster, from the
// channel sources.
func GetWorkloadsFromChannels(channels *ResourceChannels) (*Workloads, error) {
	rsChan := make(chan *ReplicaSetList)
	rcChan := make(chan *ReplicationControllerList)
	errChan := make(chan error, 2)

	go func() {
		rcList, err := GetReplicationControllerListFromChannels(channels)
		errChan <- err
		rcChan <- rcList
	}()

	go func() {
		rsList, err := GetReplicaSetListFromChannels(channels)
		errChan <- err
		rsChan <- rsList
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

	workloads := &Workloads{
		ReplicaSetList:            *rsList,
		ReplicationControllerList: *rcList,
	}

	return workloads, nil
}
