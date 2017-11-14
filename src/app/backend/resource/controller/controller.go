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

package controller

import (
	"fmt"

	"strings"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/event"
	apps "k8s.io/api/apps/v1beta2"
	batch "k8s.io/api/batch/v1"
	"k8s.io/api/core/v1"
	meta "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/types"
	client "k8s.io/client-go/kubernetes"
)

// ResourceOwner is an structure representing resource owner, it may be Replication Controller,
// Daemon Set, Job etc.
type ResourceOwner struct {
	ObjectMeta          api.ObjectMeta `json:"objectMeta"`
	TypeMeta            api.TypeMeta   `json:"typeMeta"`
	Pods                common.PodInfo `json:"pods"`
	ContainerImages     []string       `json:"containerImages"`
	InitContainerImages []string       `json:"initContainerImages"`
}

// LogSources is a structure that represents all log files (all combinations of pods and container)
// from a higher level controller (such as ReplicaSet).
type LogSources struct {
	ContainerNames     []string `json:"containerNames"`
	InitContainerNames []string `json:"initContainerNames"`
	PodNames           []string `json:"podNames"`
}

// ResourceController is an interface, that allows to perform operations on resource controller. To
// instantiate it use NewResourceController and pass object reference to it. It may be extended to
// provide more detailed set of functions.
type ResourceController interface {
	// UID returns UID of controlled resource.
	UID() types.UID
	// Get is a method, that returns ResourceOwner object.
	Get(allPods []v1.Pod, allEvents []v1.Event) ResourceOwner
	// Returns all log sources of controlled resource (e.g. a list of containers and pods for a replica set).
	GetLogSources(allPods []v1.Pod) LogSources
}

// NewResourceController creates instance of ResourceController based on given reference. It allows
// to convert owner/created by references to real objects.
func NewResourceController(ref meta.OwnerReference, namespace string, client client.Interface) (
	ResourceController, error) {
	switch strings.ToLower(ref.Kind) {
	case api.ResourceKindJob:
		job, err := client.BatchV1().Jobs(namespace).Get(ref.Name, meta.GetOptions{})
		if err != nil {
			return nil, err
		}
		return JobController(*job), nil
	case api.ResourceKindReplicaSet:
		rs, err := client.AppsV1beta2().ReplicaSets(namespace).Get(ref.Name, meta.GetOptions{})
		if err != nil {
			return nil, err
		}
		return ReplicaSetController(*rs), nil
	case api.ResourceKindReplicationController:
		rc, err := client.CoreV1().ReplicationControllers(namespace).Get(ref.Name, meta.GetOptions{})
		if err != nil {
			return nil, err
		}
		return ReplicationControllerController(*rc), nil
	case api.ResourceKindDaemonSet:
		ds, err := client.AppsV1beta2().DaemonSets(namespace).Get(ref.Name, meta.GetOptions{})
		if err != nil {
			return nil, err
		}
		return DaemonSetController(*ds), nil
	case api.ResourceKindStatefulSet:
		ss, err := client.AppsV1beta2().StatefulSets(namespace).Get(ref.Name, meta.GetOptions{})
		if err != nil {
			return nil, err
		}
		return StatefulSetController(*ss), nil
	default:
		return nil, fmt.Errorf("Unknown reference kind %s", ref.Kind)
	}
}

// JobController is an alias-type for Kubernetes API Job type. It allows to provide custom set of
// functions for already existing type.
type JobController batch.Job

// Get is an implementation of Get method from ResourceController interface.
func (self JobController) Get(allPods []v1.Pod, allEvents []v1.Event) ResourceOwner {
	matchingPods := common.FilterPodsForJob(batch.Job(self), allPods)
	podInfo := common.GetPodInfo(self.Status.Active, self.Spec.Completions, matchingPods)
	podInfo.Warnings = event.GetPodsEventWarnings(allEvents, matchingPods)

	return ResourceOwner{
		TypeMeta:            api.NewTypeMeta(api.ResourceKindJob),
		ObjectMeta:          api.NewObjectMeta(self.ObjectMeta),
		Pods:                podInfo,
		ContainerImages:     common.GetContainerImages(&self.Spec.Template.Spec),
		InitContainerImages: common.GetInitContainerImages(&self.Spec.Template.Spec),
	}
}

// UID is an implementation of UID method from ResourceController interface.
func (self JobController) UID() types.UID {
	return batch.Job(self).UID
}

// GetLogSources is an implementation of the GetLogSources method from ResourceController interface.
func (self JobController) GetLogSources(allPods []v1.Pod) LogSources {
	controlledPods := common.FilterPodsForJob(batch.Job(self), allPods)
	return LogSources{
		PodNames:           getPodNames(controlledPods),
		ContainerNames:     common.GetContainerNames(&self.Spec.Template.Spec),
		InitContainerNames: common.GetInitContainerNames(&self.Spec.Template.Spec),
	}
}

// ReplicaSetController is an alias-type for Kubernetes API Replica Set type. It allows to provide
// custom set of functions for already existing type.
type ReplicaSetController apps.ReplicaSet

// Get is an implementation of Get method from ResourceController interface.
func (self ReplicaSetController) Get(allPods []v1.Pod, allEvents []v1.Event) ResourceOwner {
	matchingPods := common.FilterPodsByControllerRef(&self, allPods)
	podInfo := common.GetPodInfo(self.Status.Replicas, self.Spec.Replicas, matchingPods)
	podInfo.Warnings = event.GetPodsEventWarnings(allEvents, matchingPods)

	return ResourceOwner{
		TypeMeta:            api.NewTypeMeta(api.ResourceKindReplicaSet),
		ObjectMeta:          api.NewObjectMeta(self.ObjectMeta),
		Pods:                podInfo,
		ContainerImages:     common.GetContainerImages(&self.Spec.Template.Spec),
		InitContainerImages: common.GetInitContainerImages(&self.Spec.Template.Spec),
	}
}

// UID is an implementation of UID method from ResourceController interface.
func (self ReplicaSetController) UID() types.UID {
	return apps.ReplicaSet(self).UID
}

// GetLogSources is an implementation of the GetLogSources method from ResourceController interface.
func (self ReplicaSetController) GetLogSources(allPods []v1.Pod) LogSources {
	controlledPods := common.FilterPodsByControllerRef(&self, allPods)
	return LogSources{
		PodNames:           getPodNames(controlledPods),
		ContainerNames:     common.GetContainerNames(&self.Spec.Template.Spec),
		InitContainerNames: common.GetInitContainerNames(&self.Spec.Template.Spec),
	}
}

// ReplicationControllerController is an alias-type for Kubernetes API Replication Controller type.
// It allows to provide custom set of functions for already existing type.
type ReplicationControllerController v1.ReplicationController

// Get is an implementation of Get method from ResourceController interface.
func (self ReplicationControllerController) Get(allPods []v1.Pod,
	allEvents []v1.Event) ResourceOwner {
	matchingPods := common.FilterPodsByControllerRef(&self, allPods)
	podInfo := common.GetPodInfo(self.Status.Replicas, self.Spec.Replicas, matchingPods)
	podInfo.Warnings = event.GetPodsEventWarnings(allEvents, matchingPods)

	return ResourceOwner{
		TypeMeta:            api.NewTypeMeta(api.ResourceKindReplicationController),
		ObjectMeta:          api.NewObjectMeta(self.ObjectMeta),
		Pods:                podInfo,
		ContainerImages:     common.GetContainerImages(&self.Spec.Template.Spec),
		InitContainerImages: common.GetInitContainerImages(&self.Spec.Template.Spec),
	}
}

// UID is an implementation of UID method from ResourceController interface.
func (self ReplicationControllerController) UID() types.UID {
	return v1.ReplicationController(self).UID
}

// GetLogSources is an implementation of the GetLogSources method from ResourceController interface.
func (self ReplicationControllerController) GetLogSources(allPods []v1.Pod) LogSources {
	controlledPods := common.FilterPodsByControllerRef(&self, allPods)
	return LogSources{
		PodNames:           getPodNames(controlledPods),
		ContainerNames:     common.GetContainerNames(&self.Spec.Template.Spec),
		InitContainerNames: common.GetInitContainerNames(&self.Spec.Template.Spec),
	}
}

// DaemonSetController is an alias-type for Kubernetes API Daemon Set type. It allows to provide
// custom set of functions for already existing type.
type DaemonSetController apps.DaemonSet

// Get is an implementation of Get method from ResourceController interface.
func (self DaemonSetController) Get(allPods []v1.Pod, allEvents []v1.Event) ResourceOwner {
	matchingPods := common.FilterPodsByControllerRef(&self, allPods)
	podInfo := common.GetPodInfo(self.Status.CurrentNumberScheduled,
		&self.Status.DesiredNumberScheduled, matchingPods)
	podInfo.Warnings = event.GetPodsEventWarnings(allEvents, matchingPods)

	return ResourceOwner{
		TypeMeta:            api.NewTypeMeta(api.ResourceKindDaemonSet),
		ObjectMeta:          api.NewObjectMeta(self.ObjectMeta),
		Pods:                podInfo,
		ContainerImages:     common.GetContainerImages(&self.Spec.Template.Spec),
		InitContainerImages: common.GetInitContainerImages(&self.Spec.Template.Spec),
	}
}

// UID is an implementation of UID method from ResourceController interface.
func (self DaemonSetController) UID() types.UID {
	return apps.DaemonSet(self).UID
}

// GetLogSources is an implementation of the GetLogSources method from ResourceController interface.
func (self DaemonSetController) GetLogSources(allPods []v1.Pod) LogSources {
	controlledPods := common.FilterPodsByControllerRef(&self, allPods)
	return LogSources{
		PodNames:           getPodNames(controlledPods),
		ContainerNames:     common.GetContainerNames(&self.Spec.Template.Spec),
		InitContainerNames: common.GetInitContainerNames(&self.Spec.Template.Spec),
	}
}

// StatefulSetController is an alias-type for Kubernetes API Stateful Set type. It allows to provide
// custom set of functions for already existing type.
type StatefulSetController apps.StatefulSet

// Get is an implementation of Get method from ResourceController interface.
func (self StatefulSetController) Get(allPods []v1.Pod, allEvents []v1.Event) ResourceOwner {
	matchingPods := common.FilterPodsByControllerRef(&self, allPods)
	podInfo := common.GetPodInfo(self.Status.Replicas, self.Spec.Replicas, matchingPods)
	podInfo.Warnings = event.GetPodsEventWarnings(allEvents, matchingPods)

	return ResourceOwner{
		TypeMeta:            api.NewTypeMeta(api.ResourceKindStatefulSet),
		ObjectMeta:          api.NewObjectMeta(self.ObjectMeta),
		Pods:                podInfo,
		ContainerImages:     common.GetContainerImages(&self.Spec.Template.Spec),
		InitContainerImages: common.GetInitContainerImages(&self.Spec.Template.Spec),
	}
}

// UID is an implementation of UID method from ResourceController interface.
func (self StatefulSetController) UID() types.UID {
	return apps.StatefulSet(self).UID
}

// GetLogSources is an implementation of the GetLogSources method from ResourceController interface.
func (self StatefulSetController) GetLogSources(allPods []v1.Pod) LogSources {
	controlledPods := common.FilterPodsByControllerRef(&self, allPods)
	return LogSources{
		PodNames:           getPodNames(controlledPods),
		ContainerNames:     common.GetContainerNames(&self.Spec.Template.Spec),
		InitContainerNames: common.GetInitContainerNames(&self.Spec.Template.Spec),
	}
}

func getPodNames(pods []v1.Pod) []string {
	names := make([]string, 0)
	for _, pod := range pods {
		names = append(names, pod.Name)
	}
	return names
}
