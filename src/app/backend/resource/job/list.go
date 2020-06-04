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

package job

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/errors"
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/event"
	batch "k8s.io/api/batch/v1"
	v1 "k8s.io/api/core/v1"
	client "k8s.io/client-go/kubernetes"
)

// JobList contains a list of Jobs in the cluster.
type JobList struct {
	ListMeta          api.ListMeta       `json:"listMeta"`
	CumulativeMetrics []metricapi.Metric `json:"cumulativeMetrics"`

	// Basic information about resources status on the list.
	Status common.ResourceStatus `json:"status"`

	// Unordered list of Jobs.
	Jobs []Job `json:"jobs"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

type JobStatusType string

const (
	// JobStatusRunning means the job is still running.
	JobStatusRunning JobStatusType = "Running"
	// JobStatusComplete means the job has completed its execution.
	JobStatusComplete JobStatusType = "Complete"
	// JobStatusFailed means the job has failed its execution.
	JobStatusFailed JobStatusType = "Failed"
)

type JobStatus struct {
	// Short, machine understandable job status code.
	Status JobStatusType `json:"status"`
	// A human-readable description of the status of related job.
	Message string `json:"message"`
	// Conditions describe the state of a job after it finishes.
	Conditions []common.Condition `json:"conditions"`
}

// Job is a presentation layer view of Kubernetes Job resource. This means it is Job plus additional
// augmented data we can get from other sources
type Job struct {
	ObjectMeta api.ObjectMeta `json:"objectMeta"`
	TypeMeta   api.TypeMeta   `json:"typeMeta"`

	// Aggregate information about pods belonging to this Job.
	Pods common.PodInfo `json:"podInfo"`

	// Container images of the Job.
	ContainerImages []string `json:"containerImages"`

	// Init Container images of the Job.
	InitContainerImages []string `json:"initContainerImages"`

	// number of parallel jobs defined.
	Parallelism *int32 `json:"parallelism"`

	// JobStatus contains inferred job status based on job conditions
	JobStatus JobStatus `json:"jobStatus"`
}

// GetJobList returns a list of all Jobs in the cluster.
func GetJobList(client client.Interface, nsQuery *common.NamespaceQuery,
	dsQuery *dataselect.DataSelectQuery, metricClient metricapi.MetricClient) (*JobList, error) {
	log.Print("Getting list of all jobs in the cluster")

	channels := &common.ResourceChannels{
		JobList:   common.GetJobListChannel(client, nsQuery, 1),
		PodList:   common.GetPodListChannel(client, nsQuery, 1),
		EventList: common.GetEventListChannel(client, nsQuery, 1),
	}

	return GetJobListFromChannels(channels, dsQuery, metricClient)
}

// GetJobListFromChannels returns a list of all Jobs in the cluster reading required resource list once from the channels.
func GetJobListFromChannels(channels *common.ResourceChannels, dsQuery *dataselect.DataSelectQuery,
	metricClient metricapi.MetricClient) (*JobList, error) {

	jobs := <-channels.JobList.List
	err := <-channels.JobList.Error
	nonCriticalErrors, criticalError := errors.HandleError(err)
	if criticalError != nil {
		return nil, criticalError
	}

	pods := <-channels.PodList.List
	err = <-channels.PodList.Error
	nonCriticalErrors, criticalError = errors.AppendError(err, nonCriticalErrors)
	if criticalError != nil {
		return nil, criticalError
	}

	events := <-channels.EventList.List
	err = <-channels.EventList.Error
	nonCriticalErrors, criticalError = errors.AppendError(err, nonCriticalErrors)
	if criticalError != nil {
		return nil, criticalError
	}

	jobList := ToJobList(jobs.Items, pods.Items, events.Items, nonCriticalErrors, dsQuery, metricClient)
	jobList.Status = getStatus(jobs, pods.Items)
	return jobList, nil
}

func ToJobList(jobs []batch.Job, pods []v1.Pod, events []v1.Event, nonCriticalErrors []error,
	dsQuery *dataselect.DataSelectQuery, metricClient metricapi.MetricClient) *JobList {

	jobList := &JobList{
		Jobs:     make([]Job, 0),
		ListMeta: api.ListMeta{TotalItems: len(jobs)},
		Errors:   nonCriticalErrors,
	}

	cachedResources := &metricapi.CachedResources{
		Pods: pods,
	}
	jobCells, metricPromises, filteredTotal := dataselect.GenericDataSelectWithFilterAndMetrics(ToCells(jobs),
		dsQuery, cachedResources, metricClient)
	jobs = FromCells(jobCells)
	jobList.ListMeta = api.ListMeta{TotalItems: filteredTotal}

	for _, job := range jobs {
		matchingPods := common.FilterPodsForJob(job, pods)
		podInfo := common.GetPodInfo(job.Status.Active, job.Spec.Completions, matchingPods)
		podInfo.Warnings = event.GetPodsEventWarnings(events, matchingPods)
		jobList.Jobs = append(jobList.Jobs, toJob(&job, &podInfo))
	}

	cumulativeMetrics, err := metricPromises.GetMetrics()
	jobList.CumulativeMetrics = cumulativeMetrics
	if err != nil {
		jobList.CumulativeMetrics = make([]metricapi.Metric, 0)
	}

	return jobList
}

func toJob(job *batch.Job, podInfo *common.PodInfo) Job {
	return Job{
		ObjectMeta:          api.NewObjectMeta(job.ObjectMeta),
		TypeMeta:            api.NewTypeMeta(api.ResourceKindJob),
		ContainerImages:     common.GetContainerImages(&job.Spec.Template.Spec),
		InitContainerImages: common.GetInitContainerImages(&job.Spec.Template.Spec),
		Pods:                *podInfo,
		JobStatus:           getJobStatus(job),
		Parallelism:         job.Spec.Parallelism,
	}
}

func getJobStatus(job *batch.Job) JobStatus {
	jobStatus := JobStatus{Status: JobStatusRunning, Conditions: getJobConditions(job)}
	for _, condition := range job.Status.Conditions {
		if condition.Type == batch.JobComplete && condition.Status == v1.ConditionTrue {
			jobStatus.Status = JobStatusComplete
			break
		} else if condition.Type == batch.JobFailed && condition.Status == v1.ConditionTrue {
			jobStatus.Status = JobStatusFailed
			jobStatus.Message = condition.Message
			break
		}
	}
	return jobStatus
}

func getJobConditions(job *batch.Job) []common.Condition {
	var conditions []common.Condition
	for _, condition := range job.Status.Conditions {
		conditions = append(conditions, common.Condition{
			Type:               string(condition.Type),
			Status:             condition.Status,
			LastProbeTime:      condition.LastProbeTime,
			LastTransitionTime: condition.LastTransitionTime,
			Reason:             condition.Reason,
			Message:            condition.Message,
		})
	}
	return conditions
}
