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

package cronjob

import (
	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/errors"
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/job"
	batch "k8s.io/api/batch/v1"
	"k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/types"
	client "k8s.io/client-go/kubernetes"
)

var emptyJobList = &job.JobList{
	Jobs:   make([]job.Job, 0),
	Errors: make([]error, 0),
	ListMeta: api.ListMeta{
		TotalItems: 0,
	},
}

// GetCronJobJobs returns list of jobs owned by cron job.
func GetCronJobJobs(client client.Interface, metricClient metricapi.MetricClient,
	dsQuery *dataselect.DataSelectQuery, namespace, name string) (*job.JobList, error) {

	cronJob, err := client.BatchV1beta1().CronJobs(namespace).Get(name, metaV1.GetOptions{})
	if err != nil {
		return emptyJobList, err
	}

	channels := &common.ResourceChannels{
		JobList:   common.GetJobListChannel(client, common.NewSameNamespaceQuery(namespace), 1),
		PodList:   common.GetPodListChannel(client, common.NewSameNamespaceQuery(namespace), 1),
		EventList: common.GetEventListChannel(client, common.NewSameNamespaceQuery(namespace), 1),
	}

	jobs := <-channels.JobList.List
	err = <-channels.JobList.Error
	nonCriticalErrors, criticalError := errors.HandleError(err)
	if criticalError != nil {
		return emptyJobList, nil
	}

	pods := <-channels.PodList.List
	err = <-channels.PodList.Error
	nonCriticalErrors, criticalError = errors.AppendError(err, nonCriticalErrors)
	if criticalError != nil {
		return emptyJobList, criticalError
	}

	events := <-channels.EventList.List
	err = <-channels.EventList.Error
	nonCriticalErrors, criticalError = errors.AppendError(err, nonCriticalErrors)
	if criticalError != nil {
		return emptyJobList, criticalError
	}

	jobs.Items = filterJobsByOwnerReferences(cronJob.Status.Active, jobs.Items)

	return job.ToJobList(jobs.Items, pods.Items, events.Items, nonCriticalErrors, dsQuery, metricClient), nil
}

func filterJobsByOwnerReferences(refs []v1.ObjectReference, jobs []batch.Job) (matchingJobs []batch.Job) {
	m := make(map[types.UID]batch.Job, 0)
	for _, j := range jobs {
		m[j.UID] = j // Map job to their UIDs to enable quick access.
	}

	for _, ref := range refs {
		matchedJob, hasMatch := m[ref.UID]
		if hasMatch {
			matchingJobs = append(matchingJobs, matchedJob)
		}
	}

	return
}
