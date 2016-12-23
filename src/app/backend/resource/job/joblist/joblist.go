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

package joblist

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/event"
	"github.com/kubernetes/dashboard/src/app/backend/resource/job"

	heapster "github.com/kubernetes/dashboard/src/app/backend/client"
	"k8s.io/kubernetes/pkg/api"
	k8serrors "k8s.io/kubernetes/pkg/api/errors"
	"k8s.io/kubernetes/pkg/apis/batch"
	client "k8s.io/kubernetes/pkg/client/clientset_generated/internalclientset"

	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/metric"
)

// JobList contains a list of Jobs in the cluster.
type JobList struct {
	ListMeta common.ListMeta `json:"listMeta"`

	// Unordered list of Jobs.
	Jobs              []Job           `json:"jobs"`
	CumulativeMetrics []metric.Metric `json:"cumulativeMetrics"`
}

// Job is a presentation layer view of Kubernetes Job resource. This means
// it is Job plus additional augmented data we can get from other sources
type Job struct {
	ObjectMeta common.ObjectMeta `json:"objectMeta"`
	TypeMeta   common.TypeMeta   `json:"typeMeta"`

	// Aggregate information about pods belonging to this Job.
	Pods common.PodInfo `json:"pods"`

	// Container images of the Job.
	ContainerImages []string `json:"containerImages"`
}

// GetJobList returns a list of all Jobs in the cluster.
func GetJobList(client client.Interface, nsQuery *common.NamespaceQuery,
	dsQuery *dataselect.DataSelectQuery, heapsterClient *heapster.HeapsterClient) (*JobList, error) {
	log.Print("Getting list of all jobs in the cluster")

	channels := &common.ResourceChannels{
		JobList:   common.GetJobListChannel(client, nsQuery, 1),
		PodList:   common.GetPodListChannel(client, nsQuery, 1),
		EventList: common.GetEventListChannel(client, nsQuery, 1),
	}

	return GetJobListFromChannels(channels, dsQuery, heapsterClient)
}

// GetJobList returns a list of all Jobs in the cluster
// reading required resource list once from the channels.
func GetJobListFromChannels(channels *common.ResourceChannels, dsQuery *dataselect.DataSelectQuery, heapsterClient *heapster.HeapsterClient) (
	*JobList, error) {

	jobs := <-channels.JobList.List
	if err := <-channels.JobList.Error; err != nil {
		statusErr, ok := err.(*k8serrors.StatusError)
		if ok && statusErr.ErrStatus.Reason == "NotFound" {
			// NotFound - this means that the server does not support Job objects, which
			// is fine.
			emptyList := &JobList{
				Jobs: make([]Job, 0),
			}
			return emptyList, nil
		}
		return nil, err
	}

	pods := <-channels.PodList.List
	if err := <-channels.PodList.Error; err != nil {
		return nil, err
	}

	events := <-channels.EventList.List
	if err := <-channels.EventList.Error; err != nil {
		return nil, err
	}

	return CreateJobList(jobs.Items, pods.Items, events.Items, dsQuery, heapsterClient), nil
}

// CreateJobList returns a list of all Job model objects in the cluster, based on all
// Kubernetes Job API objects.
func CreateJobList(jobs []batch.Job, pods []api.Pod, events []api.Event,
	dsQuery *dataselect.DataSelectQuery, heapsterClient *heapster.HeapsterClient) *JobList {

	jobList := &JobList{
		Jobs:     make([]Job, 0),
		ListMeta: common.ListMeta{TotalItems: len(jobs)},
	}

	cachedResources := &dataselect.CachedResources{
		Pods: pods,
	}
	replicationControllerCells, metricPromises := dataselect.GenericDataSelectWithMetrics(
		job.ToCells(jobs), dsQuery, cachedResources, heapsterClient)
	jobs = job.FromCells(replicationControllerCells)

	for _, job := range jobs {
		var completions int32
		matchingPods := common.FilterNamespacedPodsBySelector(pods, job.ObjectMeta.Namespace,
			job.Spec.Selector.MatchLabels)
		if job.Spec.Completions != nil {
			completions = *job.Spec.Completions
		}
		podInfo := common.GetPodInfo(job.Status.Active, completions, matchingPods)
		podInfo.Warnings = event.GetPodsEventWarnings(events, matchingPods)

		jobList.Jobs = append(jobList.Jobs, ToJob(&job, &podInfo))
	}

	cumulativeMetrics, err := metricPromises.GetMetrics()
	jobList.CumulativeMetrics = cumulativeMetrics
	if err != nil {
		jobList.CumulativeMetrics = make([]metric.Metric, 0)
	}

	return jobList
}

func ToJob(job *batch.Job, podInfo *common.PodInfo) Job {
	return Job{
		ObjectMeta:      common.NewObjectMeta(job.ObjectMeta),
		TypeMeta:        common.NewTypeMeta(common.ResourceKindJob),
		ContainerImages: common.GetContainerImages(&job.Spec.Template.Spec),
		Pods:            *podInfo,
	}
}
