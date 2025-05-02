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
	"context"

	batch "k8s.io/api/batch/v1"
	meta "k8s.io/apimachinery/pkg/apis/meta/v1"
	apimachinery "k8s.io/apimachinery/pkg/types"
	"k8s.io/apimachinery/pkg/util/rand"
	client "k8s.io/client-go/kubernetes"

	metricapi "k8s.io/dashboard/api/pkg/integration/metric/api"
	"k8s.io/dashboard/api/pkg/resource/common"
	"k8s.io/dashboard/api/pkg/resource/dataselect"
	"k8s.io/dashboard/api/pkg/resource/job"
	"k8s.io/dashboard/errors"
	"k8s.io/dashboard/types"
)

const (
	CronJobAPIVersion = "v1"
	CronJobKindName   = "cronjob"
)

var emptyJobList = &job.JobList{
	Jobs:   make([]job.Job, 0),
	Errors: make([]error, 0),
	ListMeta: types.ListMeta{
		TotalItems: 0,
	},
}

// GetCronJobJobs returns list of jobs owned by cron job.
func GetCronJobJobs(client client.Interface, metricClient metricapi.MetricClient,
	dsQuery *dataselect.DataSelectQuery, namespace, name string, active bool) (*job.JobList, error) {

	cronJob, err := client.BatchV1().CronJobs(namespace).Get(context.TODO(), name, meta.GetOptions{})
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
	nonCriticalErrors, criticalError := errors.ExtractErrors(err)
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

	jobs.Items = filterJobsByOwnerUID(cronJob.UID, jobs.Items)
	jobs.Items = filterJobsByState(active, jobs.Items)

	return job.ToJobList(jobs.Items, pods.Items, events.Items, nonCriticalErrors, dsQuery, metricClient), nil
}

// TriggerCronJob manually triggers a cron job and creates a new job.
func TriggerCronJob(client client.Interface,
	namespace, name string) error {

	cronJob, err := client.BatchV1().CronJobs(namespace).Get(context.TODO(), name, meta.GetOptions{})

	if err != nil {
		return err
	}

	annotations := make(map[string]string)
	annotations["cronjob.kubernetes.io/instantiate"] = "manual"

	labels := make(map[string]string)
	for k, v := range cronJob.Spec.JobTemplate.Labels {
		labels[k] = v
	}

	//job name cannot exceed DNS1053LabelMaxLength (52 characters)
	var newJobName string
	if len(cronJob.Name) < 42 {
		newJobName = cronJob.Name + "-manual-" + rand.String(3)
	} else {
		newJobName = cronJob.Name[0:41] + "-manual-" + rand.String(3)
	}

	jobToCreate := &batch.Job{
		ObjectMeta: meta.ObjectMeta{
			Name:            newJobName,
			Namespace:       namespace,
			Annotations:     annotations,
			Labels:          labels,
			OwnerReferences: []meta.OwnerReference{*meta.NewControllerRef(cronJob, batch.SchemeGroupVersion.WithKind("CronJob"))},
		},
		Spec: cronJob.Spec.JobTemplate.Spec,
	}

	_, err = client.BatchV1().Jobs(namespace).Create(context.TODO(), jobToCreate, meta.CreateOptions{})

	if err != nil {
		return err
	}

	return nil
}

func filterJobsByOwnerUID(UID apimachinery.UID, jobs []batch.Job) (matchingJobs []batch.Job) {
	for _, j := range jobs {
		for _, i := range j.OwnerReferences {
			if i.UID == UID {
				matchingJobs = append(matchingJobs, j)
				break
			}
		}
	}
	return
}

func filterJobsByState(active bool, jobs []batch.Job) (matchingJobs []batch.Job) {
	for _, j := range jobs {
		if active && j.Status.Active > 0 {
			matchingJobs = append(matchingJobs, j)
		} else if !active && j.Status.Active == 0 {
			matchingJobs = append(matchingJobs, j)
		}
	}
	return
}
