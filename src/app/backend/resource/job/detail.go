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
	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/errors"
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/pod"
	batch "k8s.io/api/batch/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	k8sClient "k8s.io/client-go/kubernetes"
)

// JobDetail is a presentation layer view of Kubernetes Job resource. This means
// it is Job plus additional augmented data we can get from other sources
// (like services that target the same pods).
type JobDetail struct {
	ObjectMeta api.ObjectMeta `json:"objectMeta"`
	TypeMeta   api.TypeMeta   `json:"typeMeta"`

	// Aggregate information about pods belonging to this Job.
	PodInfo common.PodInfo `json:"podInfo"`

	// Detailed information about Pods belonging to this Job.
	PodList pod.PodList `json:"podList"`

	// Container images of the Job.
	ContainerImages []string `json:"containerImages"`

	// Init container images of the Job.
	InitContainerImages []string `json:"initContainerImages"`

	// List of events related to this Job.
	EventList common.EventList `json:"eventList"`

	// Parallelism specifies the maximum desired number of pods the job should run at any given time.
	Parallelism *int32 `json:"parallelism"`

	// Completions specifies the desired number of successfully finished pods the job should be run with.
	Completions *int32 `json:"completions"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

// GetJobDetail gets job details.
func GetJobDetail(client k8sClient.Interface, metricClient metricapi.MetricClient, namespace, name string) (
	*JobDetail, error) {

	jobData, err := client.BatchV1().Jobs(namespace).Get(name, metaV1.GetOptions{})
	if err != nil {
		return nil, err
	}

	podList, err := GetJobPods(client, metricClient, dataselect.DefaultDataSelectWithMetrics, namespace, name)
	nonCriticalErrors, criticalError := errors.HandleError(err)
	if criticalError != nil {
		return nil, criticalError
	}

	podInfo, err := getJobPodInfo(client, jobData)
	nonCriticalErrors, criticalError = errors.AppendError(err, nonCriticalErrors)
	if criticalError != nil {
		return nil, criticalError
	}

	eventList, err := GetJobEvents(client, dataselect.DefaultDataSelect, jobData.Namespace, jobData.Name)
	nonCriticalErrors, criticalError = errors.AppendError(err, nonCriticalErrors)
	if criticalError != nil {
		return nil, criticalError
	}

	job := toJobDetail(jobData, *eventList, *podList, *podInfo, nonCriticalErrors)
	return &job, nil
}

func toJobDetail(job *batch.Job, eventList common.EventList, podList pod.PodList, podInfo common.PodInfo,
	nonCriticalErrors []error) JobDetail {
	return JobDetail{
		ObjectMeta:          api.NewObjectMeta(job.ObjectMeta),
		TypeMeta:            api.NewTypeMeta(api.ResourceKindJob),
		ContainerImages:     common.GetContainerImages(&job.Spec.Template.Spec),
		InitContainerImages: common.GetInitContainerImages(&job.Spec.Template.Spec),
		PodInfo:             podInfo,
		PodList:             podList,
		EventList:           eventList,
		Parallelism:         job.Spec.Parallelism,
		Completions:         job.Spec.Completions,
		Errors:              nonCriticalErrors,
	}
}
