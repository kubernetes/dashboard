// Copyright 2017 The Kubernetes Dashboard Authors.
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
	"fmt"
	"time"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/errors"
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/pod"
	"k8s.io/apimachinery/pkg/util/wait"
	apierrors "k8s.io/apimachinery/pkg/api/errors"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	utilerrors "k8s.io/apimachinery/pkg/util/errors"
	k8sClient "k8s.io/client-go/kubernetes"
	batch "k8s.io/client-go/pkg/apis/batch/v1"
)

const (
	Interval = time.Second * 1
	Timeout  = time.Minute * 5
)

// RetryParams encapsulates the retry parameters used by kubectl's scaler.
type RetryParams struct {
	Interval, Timeout time.Duration
}

func NewRetryParams(interval, timeout time.Duration) *RetryParams {
	return &RetryParams{interval, timeout}
}

type ScaleErrorType int

const (
	ScaleGetFailure ScaleErrorType = iota
	ScaleUpdateFailure
	ScaleUpdateConflictFailure
)

// A ScaleError is returned when a scale request passes
// preconditions but fails to actually scale the controller.
type ScaleError struct {
	FailureType     ScaleErrorType
	ResourceVersion string
	ActualError     error
}

func (c ScaleError) Error() string {
	return fmt.Sprintf(
		"Scaling the resource failed with: %v; Current resource version %s",
		c.ActualError, c.ResourceVersion)
}

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
		ObjectMeta:      api.NewObjectMeta(job.ObjectMeta),
		TypeMeta:        api.NewTypeMeta(api.ResourceKindJob),
		ContainerImages: common.GetContainerImages(&job.Spec.Template.Spec),
		PodInfo:         podInfo,
		PodList:         podList,
		EventList:       eventList,
		Parallelism:     job.Spec.Parallelism,
		Completions:     job.Spec.Completions,
		Errors:          nonCriticalErrors,
	}
}

// DeleteJob with given name in given namespace and related pods.
func DeleteJob(client k8sClient.Interface, namespace, name string) error {	
	job, err := client.BatchV1().Jobs(namespace).Get(name, metaV1.GetOptions{})
	if err != nil {
		return err
	}
	
	// we will never have more active pods than job.Spec.Parallelism
	parallelism := *job.Spec.Parallelism
	timeout := Timeout + time.Duration(10*parallelism)*time.Second
		
	// TODO: handle overlapping jobs
	PollInterval := time.Millisecond
	waitForJobs := NewRetryParams(PollInterval, timeout)
	
	if err = JobScale(client, namespace, name, 0, nil, waitForJobs); err != nil {
		return err
	}

	falseVar := false
	deleteOptions := &metaV1.DeleteOptions{OrphanDependents: &falseVar}

	pods, err := getRawJobPods(client, name, namespace)
	if err != nil {
		return err
	}
	errList := []error{}
	for _, pod := range pods {
		if err := client.Core().Pods(namespace).Delete(pod.Name, deleteOptions); err != nil {
			// ignores the error when the pod isn't found
			if !apierrors.IsNotFound(err) {
				errList = append(errList, err)
			}
		}
	}
	if len(errList) > 0 {
		return utilerrors.NewAggregate(errList)
	}

	// once we have all the pods removed we can safely remove the job itself.
	if err := client.BatchV1().Jobs(namespace).Delete(name, deleteOptions); err != nil {
		return err
	}

	return nil
}

// Scale updates a Job to a new size, with optional retries (if retry is not nil), 
// and then optionally waits for parallelism to reach desired number, 
// which can be less than requested based on job's current progress.
func JobScale(client k8sClient.Interface, namespace, name string, newSize uint, retry, waitForReplicas *RetryParams) error {
	if retry == nil {
		// Make it try only once, immediately
		retry = &RetryParams{Interval: time.Millisecond, Timeout: time.Millisecond}
	}
	cond := ScaleCondition(client, namespace, name, newSize, nil)
	if err := wait.Poll(retry.Interval, retry.Timeout, cond); err != nil {
		return err
	}
				 
	if waitForReplicas != nil {
		job, err := client.BatchV1().Jobs(namespace).Get(name, metaV1.GetOptions{})
		if err != nil {
			return err
		}
		err = wait.Poll(waitForReplicas.Interval, waitForReplicas.Timeout, DesiredParallelism(client, job))
		if err == wait.ErrWaitTimeout {
			return fmt.Errorf("timed out waiting for %q to be synced", name)
		}
		return err
	}
	return nil
}

// ScaleCondition is a closure around Scale that facilitates retries via util.wait
func ScaleCondition(client k8sClient.Interface, namespace, name string, count uint, updatedResourceVersion *string) wait.ConditionFunc {
	return func() (bool, error) {
		rv, err := scaleJobResource(client, namespace, name, count)
		if updatedResourceVersion != nil {
			*updatedResourceVersion = rv
		}
		switch e, _ := err.(ScaleError); err.(type) {
		case nil:
			return true, nil
		case ScaleError:
			// Retry only on update conflicts.
			if e.FailureType == ScaleUpdateConflictFailure {
				return false, nil
			}
		}
		return false, err
	}
}

// scaleJobResource is exclusively used for jobs as it does not increase/decrease pods but jobs parallelism attribute.
func scaleJobResource(client k8sClient.Interface, namespace, name string, count uint) (string, error) {
	job, err := client.BatchV1().Jobs(namespace).Get(name, metaV1.GetOptions{})

	*job.Spec.Parallelism = int32(count)
	updatedJob, err := client.BatchV1().Jobs(namespace).Update(job)
	if err != nil {
		return "", err
	}

	return updatedJob.ObjectMeta.ResourceVersion, nil
}

// DesiredParallelism returns a condition that will be true if the desired parallelism count
// for a job equals the current active counts or is less by an appropriate successful/unsuccessful count.
func DesiredParallelism(client k8sClient.Interface, job *batch.Job) wait.ConditionFunc {
	return func() (bool, error) {
		job, err := client.BatchV1().Jobs(job.Namespace).Get(job.Name, metaV1.GetOptions{})
		if err != nil {
			return false, err
		}

		// desired parallelism can be either the exact number, in which case return immediately
		if job.Status.Active == *job.Spec.Parallelism {
			return true, nil
		}
		if job.Spec.Completions == nil {
			// A job without specified completions needs to wait for Active to reach Parallelism.
			return false, nil
		}

		// otherwise count successful
		progress := *job.Spec.Completions - job.Status.Active - job.Status.Succeeded
		return progress == 0, nil
	}
}
