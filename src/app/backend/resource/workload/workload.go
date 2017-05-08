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

	"github.com/kubernetes/dashboard/src/app/backend/client"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/daemonset"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/deployment"
	"github.com/kubernetes/dashboard/src/app/backend/resource/job"
	"github.com/kubernetes/dashboard/src/app/backend/resource/pod"
	"github.com/kubernetes/dashboard/src/app/backend/resource/replicaset"
	"github.com/kubernetes/dashboard/src/app/backend/resource/replicationcontroller"
	"github.com/kubernetes/dashboard/src/app/backend/resource/statefulset"
	"k8s.io/client-go/kubernetes"
)

// Workloads structure contains all resource lists grouped into the workloads category.
type Workloads struct {
	DeploymentList deployment.DeploymentList `json:"deploymentList"`

	ReplicaSetList replicaset.ReplicaSetList `json:"replicaSetList"`

	JobList job.JobList `json:"jobList"`

	ReplicationControllerList replicationcontroller.ReplicationControllerList `json:"replicationControllerList"`

	PodList pod.PodList `json:"podList"`

	DaemonSetList daemonset.DaemonSetList `json:"daemonSetList"`

	StatefulSetList statefulset.StatefulSetList `json:"statefulSetList"`
}

// GetWorkloads returns a list of all workloads in the cluster.
func GetWorkloads(client *kubernetes.Clientset, heapsterClient client.HeapsterClient,
	nsQuery *common.NamespaceQuery, dsQuery *dataselect.DataSelectQuery) (*Workloads, error) {

	log.Print("Getting lists of all workloads")
	channels := &common.ResourceChannels{
		ReplicationControllerList: common.GetReplicationControllerListChannel(client, nsQuery, 1),
		ReplicaSetList:            common.GetReplicaSetListChannel(client, nsQuery, 2),
		JobList:                   common.GetJobListChannel(client, nsQuery, 1),
		DaemonSetList:             common.GetDaemonSetListChannel(client, nsQuery, 1),
		DeploymentList:            common.GetDeploymentListChannel(client, nsQuery, 1),
		StatefulSetList:           common.GetStatefulSetListChannel(client, nsQuery, 1),
		ServiceList:               common.GetServiceListChannel(client, nsQuery, 1),
		PodList:                   common.GetPodListChannel(client, nsQuery, 7),
		EventList:                 common.GetEventListChannel(client, nsQuery, 7),
	}

	return GetWorkloadsFromChannels(channels, heapsterClient, dsQuery)
}

// GetWorkloadsFromChannels returns a list of all workloads in the cluster, from the
// channel sources.
func GetWorkloadsFromChannels(channels *common.ResourceChannels,
	heapsterClient client.HeapsterClient, dsQuery *dataselect.DataSelectQuery) (*Workloads, error) {

	rsChan := make(chan *replicaset.ReplicaSetList)
	jobChan := make(chan *job.JobList)
	deploymentChan := make(chan *deployment.DeploymentList)
	rcChan := make(chan *replicationcontroller.ReplicationControllerList)
	podChan := make(chan *pod.PodList)
	dsChan := make(chan *daemonset.DaemonSetList)
	psChan := make(chan *statefulset.StatefulSetList)
	errChan := make(chan error, 7)

	go func() {
		rcList, err := replicationcontroller.GetReplicationControllerListFromChannels(channels,
			dsQuery, nil)
		errChan <- err
		rcChan <- rcList
	}()

	go func() {
		rsList, err := replicaset.GetReplicaSetListFromChannels(channels, dsQuery, nil)
		errChan <- err
		rsChan <- rsList
	}()

	go func() {
		jobList, err := job.GetJobListFromChannels(channels, dsQuery, nil)
		errChan <- err
		jobChan <- jobList
	}()

	go func() {
		deploymentList, err := deployment.GetDeploymentListFromChannels(channels, dsQuery, nil)
		errChan <- err
		deploymentChan <- deploymentList
	}()

	go func() {
		podList, err := pod.GetPodListFromChannels(channels,
			dataselect.NewDataSelectQuery(dsQuery.PaginationQuery, dsQuery.SortQuery,
				dsQuery.FilterQuery, dataselect.StandardMetrics), heapsterClient)
		errChan <- err
		podChan <- podList
	}()

	go func() {
		dsList, err := daemonset.GetDaemonSetListFromChannels(channels, dsQuery, nil)
		errChan <- err
		dsChan <- dsList
	}()

	go func() {
		psList, err := statefulset.GetStatefulSetListFromChannels(channels, dsQuery, nil)
		errChan <- err
		psChan <- psList
	}()

	rcList := <-rcChan
	err := <-errChan
	if err != nil {
		return nil, err
	}

	podList := <-podChan
	err = <-errChan
	if err != nil {
		return nil, err
	}

	rsList := <-rsChan
	err = <-errChan
	if err != nil {
		return nil, err
	}

	jobList := <-jobChan
	err = <-errChan
	if err != nil {
		return nil, err
	}

	deploymentList := <-deploymentChan
	err = <-errChan
	if err != nil {
		return nil, err
	}

	dsList := <-dsChan
	err = <-errChan
	if err != nil {
		return nil, err
	}

	psList := <-psChan
	err = <-errChan
	if err != nil {
		return nil, err
	}

	workloads := &Workloads{
		ReplicaSetList:            *rsList,
		JobList:                   *jobList,
		ReplicationControllerList: *rcList,
		DeploymentList:            *deploymentList,
		PodList:                   *podList,
		DaemonSetList:             *dsList,
		StatefulSetList:           *psList,
	}

	return workloads, nil
}
