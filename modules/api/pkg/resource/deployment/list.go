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

package deployment

import (
	apps "k8s.io/api/apps/v1"
	v1 "k8s.io/api/core/v1"
	client "k8s.io/client-go/kubernetes"
	"k8s.io/klog/v2"

	metricapi "k8s.io/dashboard/api/pkg/integration/metric/api"
	"k8s.io/dashboard/api/pkg/resource/common"
	"k8s.io/dashboard/api/pkg/resource/dataselect"
	"k8s.io/dashboard/api/pkg/resource/event"
	"k8s.io/dashboard/errors"
	"k8s.io/dashboard/types"
)

// DeploymentList contains a list of Deployments in the cluster.
type DeploymentList struct {
	ListMeta          types.ListMeta     `json:"listMeta"`
	CumulativeMetrics []metricapi.Metric `json:"cumulativeMetrics"`

	// Basic information about resources status on the list.
	Status common.ResourceStatus `json:"status"`

	// Unordered list of Deployments.
	Deployments []Deployment `json:"deployments"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

// Deployment is a presentation layer view of Kubernetes Deployment resource. This means
// it is Deployment plus additional augmented data we can get from other sources
// (like services that target the same pods).
type Deployment struct {
	ObjectMeta types.ObjectMeta `json:"objectMeta"`
	TypeMeta   types.TypeMeta   `json:"typeMeta"`

	// Aggregate information about pods belonging to this Deployment.
	Pods common.PodInfo `json:"pods"`

	// Container images of the Deployment.
	ContainerImages []string `json:"containerImages"`

	// Init Container images of the Deployment.
	InitContainerImages []string `json:"initContainerImages"`
}

// GetDeploymentList returns a list of all Deployments in the cluster.
func GetDeploymentList(client client.Interface, nsQuery *common.NamespaceQuery, dsQuery *dataselect.DataSelectQuery,
	metricClient metricapi.MetricClient) (*DeploymentList, error) {
	klog.V(4).Infof("Getting list of all deployments in the cluster")

	channels := &common.ResourceChannels{
		DeploymentList: common.GetDeploymentListChannel(client, nsQuery, 1),
		PodList:        common.GetPodListChannel(client, nsQuery, 1),
		EventList:      common.GetEventListChannel(client, nsQuery, 1),
		ReplicaSetList: common.GetReplicaSetListChannel(client, nsQuery, 1),
	}

	return GetDeploymentListFromChannels(channels, dsQuery, metricClient)
}

// GetDeploymentListFromChannels returns a list of all Deployments in the cluster
// reading required resource list once from the channels.
func GetDeploymentListFromChannels(channels *common.ResourceChannels, dsQuery *dataselect.DataSelectQuery,
	metricClient metricapi.MetricClient) (*DeploymentList, error) {

	deployments := <-channels.DeploymentList.List
	err := <-channels.DeploymentList.Error
	nonCriticalErrors, criticalError := errors.ExtractErrors(err)
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

	rs := <-channels.ReplicaSetList.List
	err = <-channels.ReplicaSetList.Error
	nonCriticalErrors, criticalError = errors.AppendError(err, nonCriticalErrors)
	if criticalError != nil {
		return nil, criticalError
	}

	deploymentList := toDeploymentList(deployments.Items, pods.Items, events.Items, rs.Items, nonCriticalErrors,
		dsQuery, metricClient)
	deploymentList.Status = getStatus(deployments, rs.Items, pods.Items, events.Items)
	return deploymentList, nil
}

func toDeploymentList(deployments []apps.Deployment, pods []v1.Pod, events []v1.Event, rs []apps.ReplicaSet,
	nonCriticalErrors []error, dsQuery *dataselect.DataSelectQuery, metricClient metricapi.MetricClient) *DeploymentList {

	deploymentList := &DeploymentList{
		Deployments: make([]Deployment, 0),
		ListMeta:    types.ListMeta{TotalItems: len(deployments)},
		Errors:      nonCriticalErrors,
	}

	cachedResources := &metricapi.CachedResources{
		Pods: pods,
	}
	deploymentCells, metricPromises, filteredTotal := dataselect.GenericDataSelectWithFilterAndMetrics(
		toCells(deployments), dsQuery, cachedResources, metricClient)
	deployments = fromCells(deploymentCells)
	deploymentList.ListMeta = types.ListMeta{TotalItems: filteredTotal}

	for _, deployment := range deployments {
		deploymentList.Deployments = append(deploymentList.Deployments, toDeployment(&deployment, rs, pods, events))
	}

	cumulativeMetrics, err := metricPromises.GetMetrics()
	deploymentList.CumulativeMetrics = cumulativeMetrics
	if err != nil {
		deploymentList.CumulativeMetrics = make([]metricapi.Metric, 0)
	}

	return deploymentList
}

func toDeployment(deployment *apps.Deployment, rs []apps.ReplicaSet, pods []v1.Pod, events []v1.Event) Deployment {
	matchingPods := common.FilterDeploymentPodsByOwnerReference(*deployment, rs, pods)
	podInfo := common.GetPodInfo(deployment.Status.Replicas, deployment.Spec.Replicas, matchingPods)
	podInfo.Warnings = event.GetPodsEventWarnings(events, matchingPods)

	return Deployment{
		ObjectMeta:          types.NewObjectMeta(deployment.ObjectMeta),
		TypeMeta:            types.NewTypeMeta(types.ResourceKindDeployment),
		Pods:                podInfo,
		ContainerImages:     common.GetContainerImages(&deployment.Spec.Template.Spec),
		InitContainerImages: common.GetInitContainerImages(&deployment.Spec.Template.Spec),
	}
}
