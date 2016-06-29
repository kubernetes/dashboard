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

package job

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"k8s.io/kubernetes/pkg/api"
	k8serrors "k8s.io/kubernetes/pkg/api/errors"
	"k8s.io/kubernetes/pkg/apis/batch"
	client "k8s.io/kubernetes/pkg/client/unversioned"
)

// JobList contains a list of Jobs in the cluster.
type JobList struct {
	ListMeta common.ListMeta `json:"listMeta"`

	// Unordered list of Jobs.
	Jobs []Job `json:"jobs"`
}

// Job is a presentation layer view of Kubernetes Job resource. This means
// it is Job plus additional augumented data we can get from other sources
type Job struct {
	ObjectMeta common.ObjectMeta `json:"objectMeta"`
	TypeMeta   common.TypeMeta   `json:"typeMeta"`

	// Aggregate information about pods belonging to this Job.
	Pods common.PodInfo `json:"pods"`

	// Container images of the Job.
	ContainerImages []string `json:"containerImages"`
}

// GetJobList returns a list of all Jobs in the cluster.
func GetJobList(client client.Interface, nsQuery *common.NamespaceQuery) (*JobList, error) {
	log.Printf("Getting list of all jobs in the cluster")

	channels := &common.ResourceChannels{
		JobList:   common.GetJobListChannel(client.Extensions(), nsQuery, 1),
		PodList:   common.GetPodListChannel(client, nsQuery, 1),
		EventList: common.GetEventListChannel(client, nsQuery, 1),
	}

	return GetJobListFromChannels(channels)
}

// GetJobList returns a list of all Jobs in the cluster
// reading required resource list once from the channels.
func GetJobListFromChannels(channels *common.ResourceChannels) (
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

	return ToJobList(jobs.Items, pods.Items, events.Items), nil
}

func ToJobList(jobs []batch.Job, pods []api.Pod, events []api.Event) *JobList {

	jobList := &JobList{
		Jobs: make([]Job, 0),
		ListMeta: common.ListMeta{TotalItems: len(jobs)},
	}

	for _, job := range jobs {
		matchingPods := common.FilterNamespacedPodsBySelector(pods, job.ObjectMeta.Namespace,
			job.Spec.Selector.MatchLabels)
		podInfo := getPodInfo(&job, matchingPods)

		jobList.Jobs = append(jobList.Jobs, ToJob(&job, &podInfo))
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
