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

	"github.com/kubernetes/dashboard/client"
	"github.com/kubernetes/dashboard/resource/common"
	"github.com/kubernetes/dashboard/resource/pod"
	resourceService "github.com/kubernetes/dashboard/resource/service"
	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/api/unversioned"
	"k8s.io/kubernetes/pkg/apis/batch"
	k8sClient "k8s.io/kubernetes/pkg/client/unversioned"
	"k8s.io/kubernetes/pkg/fields"
	"k8s.io/kubernetes/pkg/labels"
)

// JobDetail represents detailed information about a Job.
type JobDetail struct {
	ObjectMeta common.ObjectMeta `json:"objectMeta"`
	TypeMeta   common.TypeMeta   `json:"typeMeta"`

	// Label selector of the Job.
	LabelSelector *unversioned.LabelSelector `json:"labelSelector,omitempty"`

	// Container image list of the pod template specified by this Job.
	ContainerImages []string `json:"containerImages"`

	// Aggregate information about pods of this job.
	PodInfo common.PodInfo `json:"podInfo"`

	// Detailed information about Pods belonging to this Job.
	Pods pod.PodList `json:"pods"`

	// Detailed information about service related to Job.
	ServiceList resourceService.ServiceList `json:"serviceList"`

	// True when the data contains at least one pod with metrics information, false otherwise.
	HasMetrics bool `json:"hasMetrics"`
}

// GetJobDetail returns detailed information about the given job in the given namespace.
func GetJobDetail(client k8sClient.Interface, heapsterClient client.HeapsterClient,
	namespace, name string) (*JobDetail, error) {
	log.Printf("Getting details of %s job in %s namespace", name, namespace)

	jobWithPods, err := getRawJobWithPods(client, namespace, name)
	if err != nil {
		return nil, err
	}
	job := jobWithPods.Job
	pods := jobWithPods.Pods

	services, err := client.Services(namespace).List(api.ListOptions{
		LabelSelector: labels.Everything(),
		FieldSelector: fields.Everything(),
	})

	nodes, err := client.Nodes().List(api.ListOptions{
		LabelSelector: labels.Everything(),
		FieldSelector: fields.Everything(),
	})

	if err != nil {
		return nil, err
	}

	jobDetail := &JobDetail{
		ObjectMeta:    common.NewObjectMeta(job.ObjectMeta),
		TypeMeta:      common.NewTypeMeta(common.ResourceKindJob),
		LabelSelector: job.Spec.Selector,
		PodInfo:       getJobPodInfo(job, pods.Items),
		ServiceList: resourceService.ServiceList{Services: make(
			[]resourceService.Service, 0)},
	}

	matchingServices := getMatchingServicesforDS(services.Items, job)

	for _, service := range matchingServices {
		jobDetail.ServiceList.Services = append(jobDetail.ServiceList.Services,
			getService(service, *job, pods.Items, nodes.Items))
	}

	for _, container := range job.Spec.Template.Spec.Containers {
		jobDetail.ContainerImages = append(jobDetail.ContainerImages,
			container.Image)
	}

	jobDetail.Pods = pod.CreatePodList(pods.Items, heapsterClient)

	return jobDetail, nil
}

// TODO(floreks): This should be transactional to make sure that DS will not be deleted without pods
// DeleteJob deletes job with given name in given namespace and related pods.
// Also deletes services related to job if deleteServices is true.
func DeleteJob(client k8sClient.Interface, namespace, name string,
	deleteServices bool) error {

	log.Printf("Deleting %s job from %s namespace", name, namespace)

	if deleteServices {
		if err := DeleteJobServices(client, namespace, name); err != nil {
			return err
		}
	}

	pods, err := getRawJobPods(client, namespace, name)
	if err != nil {
		return err
	}

	if err := client.Extensions().Jobs(namespace).Delete(name,
		&api.DeleteOptions{}); err != nil {
		return err
	}

	for _, pod := range pods.Items {
		if err := client.Pods(namespace).Delete(pod.Name,
			&api.DeleteOptions{}); err != nil {
			return err
		}
	}

	log.Printf("Successfully deleted %s job from %s namespace", name, namespace)

	return nil
}

// DeleteJobServices deletes services related to job with given name in given namespace.
func DeleteJobServices(client k8sClient.Interface, namespace, name string) error {
	log.Printf("Deleting services related to %s job from %s namespace", name,
		namespace)

	job, err := client.Extensions().Jobs(namespace).Get(name)
	if err != nil {
		return err
	}

	labelSelector, err := unversioned.LabelSelectorAsSelector(job.Spec.Selector)
	if err != nil {
		return err
	}

	services, err := getServicesForDSDeletion(client, labelSelector, namespace)
	if err != nil {
		return err
	}

	for _, service := range services {
		if err := client.Services(namespace).Delete(service.Name); err != nil {
			return err
		}
	}

	log.Printf("Successfully deleted services related to %s job from %s namespace",
		name, namespace)

	return nil
}

// Returns detailed information about service from given service
func getService(service api.Service, job batch.Job, pods []api.Pod,
	nodes []api.Node) resourceService.Service {

	result := resourceService.ToService(&service)
	// TODO: This may be wrong as we dont use all attributes from selector
	result.ExternalEndpoints = common.GetExternalEndpoints(job.Spec.Selector.MatchLabels, pods,
		service, nodes)

	return result
}
