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

	"github.com/kubernetes/dashboard/resource/common"
	"github.com/kubernetes/dashboard/resource/event"
	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/apis/batch"
	client "k8s.io/kubernetes/pkg/client/unversioned"
)

// JobList contains a list of Jobs in the cluster.
type JobList struct {
	// Unordered list of Jobs
	Jobs []Job `json:"jobs"`
}

// Job (aka. Job) plus zero or more Kubernetes services that
// target the Job.
type Job struct {
	ObjectMeta common.ObjectMeta `json:"objectMeta"`
	TypeMeta   common.TypeMeta   `json:"typeMeta"`

	// Aggregate information about pods belonging to this Job.
	Pods common.PodInfo `json:"pods"`

	// Container images of the Job.
	ContainerImages []string `json:"containerImages"`

	// Internal endpoints of all Kubernetes services have the same label selector as this Job.
	InternalEndpoints []common.Endpoint `json:"internalEndpoints"`

	// External endpoints of all Kubernetes services have the same label selector as this Job.
	ExternalEndpoints []common.Endpoint `json:"externalEndpoints"`
}

// GetJobList returns a list of all Job in the cluster.
func GetJobList(client *client.Client, nsQuery *common.NamespaceQuery) (*JobList, error) {
	log.Printf("Getting list of all jobs in the cluster")
	channels := &common.ResourceChannels{
		JobList:     common.GetJobListChannel(client.Extensions(), nsQuery, 1),
		ServiceList: common.GetServiceListChannel(client, nsQuery, 1),
		PodList:     common.GetPodListChannel(client, nsQuery, 1),
		EventList:   common.GetEventListChannel(client, nsQuery, 1),
		NodeList:    common.GetNodeListChannel(client, nsQuery, 1),
	}

	return GetJobListFromChannels(channels)
}

// GetJobList returns a list of all Jobs in the cluster reading required resource list once from
// the channels.
func GetJobListFromChannels(channels *common.ResourceChannels) (
	*JobList, error) {

	jobs := <-channels.JobList.List
	if err := <-channels.JobList.Error; err != nil {
		return nil, err
	}

	services := <-channels.ServiceList.List
	if err := <-channels.ServiceList.Error; err != nil {
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

	nodes := <-channels.NodeList.List
	if err := <-channels.NodeList.Error; err != nil {
		return nil, err
	}

	result := getJobList(jobs.Items, services.Items,
		pods.Items, events.Items, nodes.Items)

	return result, nil
}

// Returns a list of all Job model objects in the cluster, based on all Kubernetes Job and Service
// API objects. The function processes all Job API objects and finds matching Services for them.
func getJobList(jobs []batch.Job, services []api.Service, pods []api.Pod, events []api.Event,
	nodes []api.Node) *JobList {

	jobList := &JobList{Jobs: make([]Job, 0)}

	for _, job := range jobs {

		matchingServices := getMatchingServicesforDS(services, &job)
		var internalEndpoints []common.Endpoint
		var externalEndpoints []common.Endpoint
		for _, service := range matchingServices {
			internalEndpoints = append(internalEndpoints,
				common.GetInternalEndpoint(service.Name, service.Namespace,
					service.Spec.Ports))
			// TODO: This may be wrong as we dont use all attributes from selector
			externalEndpoints = common.
				GetExternalEndpoints(job.Spec.Selector.MatchLabels, pods,
					service, nodes)
		}

		matchingPods := make([]api.Pod, 0)
		for _, pod := range pods {
			if pod.ObjectMeta.Namespace == job.ObjectMeta.Namespace &&
				common.IsLabelSelectorMatching(pod.ObjectMeta.Labels,
					job.Spec.Selector) {
				matchingPods = append(matchingPods, pod)
			}
		}
		podInfo := getJobPodInfo(&job, matchingPods)
		podErrors := event.GetPodsEventWarnings(events, matchingPods)

		podInfo.Warnings = podErrors

		jobList.Jobs = append(jobList.Jobs,
			Job{
				ObjectMeta: common.NewObjectMeta(job.ObjectMeta),
				TypeMeta:   common.NewTypeMeta(common.ResourceKindJob),
				Pods:       podInfo,
				ContainerImages: common.
					GetContainerImages(&job.Spec.Template.Spec),
				InternalEndpoints: internalEndpoints,
				ExternalEndpoints: externalEndpoints,
			})
	}

	return jobList
}

// Returns all services that target the same Pods (or subset) as the given Job.
func getMatchingServicesforDS(services []api.Service, job *batch.Job) []api.Service {

	var matchingServices []api.Service
	for _, service := range services {
		if service.ObjectMeta.Namespace == job.ObjectMeta.Namespace &&
			common.IsLabelSelectorMatching(service.Spec.Selector, job.Spec.Selector) {

			matchingServices = append(matchingServices, service)
		}
	}
	return matchingServices
}
