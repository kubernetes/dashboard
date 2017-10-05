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

package workload

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/errors"
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/cronjob"
	"github.com/kubernetes/dashboard/src/app/backend/resource/daemonset"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/deployment"
	"github.com/kubernetes/dashboard/src/app/backend/resource/job"
	"github.com/kubernetes/dashboard/src/app/backend/resource/pod"
	"github.com/kubernetes/dashboard/src/app/backend/resource/replicaset"
	rc "github.com/kubernetes/dashboard/src/app/backend/resource/replicationcontroller"
	"github.com/kubernetes/dashboard/src/app/backend/resource/statefulset"
	"k8s.io/client-go/kubernetes"
)

// Workloads structure contains all resource lists grouped into the workloads category.
type Workloads struct {
	DeploymentList            deployment.DeploymentList    `json:"deploymentList"`
	ReplicaSetList            replicaset.ReplicaSetList    `json:"replicaSetList"`
	JobList                   job.JobList                  `json:"jobList"`
	CronJobList               cronjob.CronJobList          `json:"cronJobList"`
	ReplicationControllerList rc.ReplicationControllerList `json:"replicationControllerList"`
	PodList                   pod.PodList                  `json:"podList"`
	DaemonSetList             daemonset.DaemonSetList      `json:"daemonSetList"`
	StatefulSetList           statefulset.StatefulSetList  `json:"statefulSetList"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

// GetWorkloads returns a list of all workloads in the cluster.
func GetWorkloads(client kubernetes.Interface, metricClient metricapi.MetricClient,
	nsQuery *common.NamespaceQuery, dsQuery *dataselect.DataSelectQuery) (*Workloads, error) {

	log.Print("Getting lists of all workloads")
	channels := &common.ResourceChannels{
		ReplicationControllerList: common.GetReplicationControllerListChannel(client, nsQuery, 1),
		ReplicaSetList:            common.GetReplicaSetListChannel(client, nsQuery, 2),
		JobList:                   common.GetJobListChannel(client, nsQuery, 1),
		CronJobList:               common.GetCronJobListChannel(client, nsQuery, 1),
		DaemonSetList:             common.GetDaemonSetListChannel(client, nsQuery, 1),
		DeploymentList:            common.GetDeploymentListChannel(client, nsQuery, 1),
		StatefulSetList:           common.GetStatefulSetListChannel(client, nsQuery, 1),
		ServiceList:               common.GetServiceListChannel(client, nsQuery, 1),
		PodList:                   common.GetPodListChannel(client, nsQuery, 7),
		EventList:                 common.GetEventListChannel(client, nsQuery, 7),
	}

	return GetWorkloadsFromChannels(channels, metricClient, dsQuery)
}

// GetWorkloadsFromChannels returns a list of all workloads in the cluster, from the channel sources.
func GetWorkloadsFromChannels(channels *common.ResourceChannels, metricClient metricapi.MetricClient,
	dsQuery *dataselect.DataSelectQuery) (*Workloads, error) {

	numErrs := 8
	errChan := make(chan error, numErrs)
	rsChan := make(chan *replicaset.ReplicaSetList)
	jobChan := make(chan *job.JobList)
	cjChan := make(chan *cronjob.CronJobList)
	deploymentChan := make(chan *deployment.DeploymentList)
	rcChan := make(chan *rc.ReplicationControllerList)
	podChan := make(chan *pod.PodList)
	dsChan := make(chan *daemonset.DaemonSetList)
	ssChan := make(chan *statefulset.StatefulSetList)

	go func() {
		rcList, err := rc.GetReplicationControllerListFromChannels(channels, dsQuery, nil)
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
		cronJobList, err := cronjob.GetCronJobListFromChannels(channels, dsQuery, nil)
		errChan <- err
		cjChan <- cronJobList
	}()

	go func() {
		deploymentList, err := deployment.GetDeploymentListFromChannels(channels, dsQuery, nil)
		errChan <- err
		deploymentChan <- deploymentList
	}()

	go func() {
		podList, err := pod.GetPodListFromChannels(channels, dataselect.NewDataSelectQuery(
			dsQuery.PaginationQuery, dsQuery.SortQuery, dsQuery.FilterQuery,
			dataselect.StandardMetrics), metricClient)
		errChan <- err
		podChan <- podList
	}()

	go func() {
		dsList, err := daemonset.GetDaemonSetListFromChannels(channels, dsQuery, nil)
		errChan <- err
		dsChan <- dsList
	}()

	go func() {
		ssList, err := statefulset.GetStatefulSetListFromChannels(channels, dsQuery, nil)
		errChan <- err
		ssChan <- ssList
	}()

	for i := 0; i < numErrs; i++ {
		err := <-errChan
		if err != nil {
			return nil, err
		}
	}

	workloads := &Workloads{
		ReplicaSetList:            *(<-rsChan),
		JobList:                   *(<-jobChan),
		CronJobList:               *(<-cjChan),
		ReplicationControllerList: *(<-rcChan),
		DeploymentList:            *(<-deploymentChan),
		PodList:                   *(<-podChan),
		DaemonSetList:             *(<-dsChan),
		StatefulSetList:           *(<-ssChan),
	}

	workloads.Errors = errors.MergeErrors(workloads.DaemonSetList.Errors, workloads.DeploymentList.Errors,
		workloads.JobList.Errors, workloads.CronJobList.Errors, workloads.PodList.Errors,
		workloads.ReplicaSetList.Errors, workloads.ReplicationControllerList.Errors, workloads.StatefulSetList.Errors)

	return workloads, nil
}
