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

package controller

import (
	"fmt"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/event"
	meta "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/fields"
	"k8s.io/apimachinery/pkg/labels"
	"k8s.io/apimachinery/pkg/types"
	client "k8s.io/client-go/kubernetes"
	"k8s.io/client-go/pkg/api/v1"
	apps "k8s.io/client-go/pkg/apis/apps/v1beta1"
	batch "k8s.io/client-go/pkg/apis/batch/v1"
	extensions "k8s.io/client-go/pkg/apis/extensions/v1beta1"
	"strings"
)

var listEverything = meta.ListOptions{
	LabelSelector: labels.Everything().String(),
	FieldSelector: fields.Everything().String(),
}

// ResourceOwner is an structure representing resource owner, it may be Replication Controller,
// Daemon Set, Job etc.
type ResourceOwner struct {
	ObjectMeta      api.ObjectMeta `json:"objectMeta"`
	TypeMeta        api.TypeMeta   `json:"typeMeta"`
	Pods            common.PodInfo `json:"pods"`
	ContainerImages []string       `json:"containerImages"`
}

// LogSources is a structure that represents all log files (all combinations of pods and container) from a higher level controller (such as ReplicaSet)
type LogSources struct {
	ContainerNames []string `json:"containerNames"`
	PodNames       []string `json:"podNames"`
}

// ResourceController is an interface, that allows to perform operations on resource controller. To
// instantiate it use NewResourceController and pass object reference to it. It may be extended to
// provide more detailed set of functions.
type ResourceController interface {
	// UID returns UID of controlled resource.
	UID() types.UID
	// Get is a method, that returns ResourceOwner object.
	Get(allPods []v1.Pod, allEvents []v1.Event) ResourceOwner
	// Returns all log sources of controlled resource (e.g. a list of containers and pods for a replica set)
	GetLogSources(k8sClient *client.Clientset) LogSources
}

// NewResourceController creates instance of ResourceController based on given reference. It allows
// to convert owner/created by references to real objects.
func NewResourceController(reference v1.ObjectReference, client client.Interface) (
	ResourceController, error) {
	switch strings.ToLower(reference.Kind) {
	case api.ResourceKindJob:
		job, err := client.BatchV1().Jobs(reference.Namespace).Get(reference.Name,
			meta.GetOptions{})
		if err != nil {
			return nil, err
		}
		return JobController(*job), nil
	case api.ResourceKindReplicaSet:
		rs, err := client.ExtensionsV1beta1().ReplicaSets(reference.Namespace).Get(reference.Name,
			meta.GetOptions{})
		if err != nil {
			return nil, err
		}
		return ReplicaSetController(*rs), nil
	case api.ResourceKindReplicationController:
		rc, err := client.CoreV1().ReplicationControllers(reference.Namespace).Get(
			reference.Name, meta.GetOptions{})
		if err != nil {
			return nil, err
		}
		return ReplicationControllerController(*rc), nil
	case api.ResourceKindDaemonSet:
		ds, err := client.ExtensionsV1beta1().DaemonSets(reference.Namespace).Get(reference.Name,
			meta.GetOptions{})
		if err != nil {
			return nil, err
		}
		return DaemonSetController(*ds), nil
	case api.ResourceKindStatefulSet:
		ss, err := client.AppsV1beta1().StatefulSets(reference.Namespace).Get(reference.Name,
			meta.GetOptions{})
		if err != nil {
			return nil, err
		}
		return StatefulSetController(*ss), nil
	default:
		return nil, fmt.Errorf("Unknown reference kind %s", reference.Kind)
	}
}

// JobController is an alias-type for Kubernetes API Job type. It allows to provide custom set of
// functions for already existing type.
type JobController batch.Job

// Get is an implementation of Get method from ResourceController interface.
func (self JobController) Get(allPods []v1.Pod, allEvents []v1.Event) ResourceOwner {
	matchingPods := common.FilterPodsForJob(batch.Job(self), allPods)
	var completions int32
	if self.Spec.Completions != nil {
		completions = *self.Spec.Completions
	}
	podInfo := common.GetPodInfo(self.Status.Active, completions, matchingPods)
	podInfo.Warnings = event.GetPodsEventWarnings(allEvents, matchingPods)

	return ResourceOwner{
		TypeMeta:        api.NewTypeMeta(api.ResourceKindJob),
		ObjectMeta:      api.NewObjectMeta(self.ObjectMeta),
		Pods:            podInfo,
		ContainerImages: common.GetContainerImages(&self.Spec.Template.Spec),
	}
}

// UID is an implementation of UID method from ResourceController interface.
func (self JobController) UID() types.UID {
	return batch.Job(self).UID
}

// GetLogSources is an implementation of the GetLogSources method from ResourceController interface.
func (self JobController) GetLogSources(k8sClient *client.Clientset) LogSources {
	return LogSources{
		PodNames:       getPodNames(k8sClient, self.Namespace, self.UID()),
		ContainerNames: common.GetContainerNames(&self.Spec.Template.Spec),
	}
}

// ReplicaSetController is an alias-type for Kubernetes API Replica Set type. It allows to provide
// custom set of functions for already existing type.
type ReplicaSetController extensions.ReplicaSet

// Get is an implementation of Get method from ResourceController interface.
func (self ReplicaSetController) Get(allPods []v1.Pod, allEvents []v1.Event) ResourceOwner {
	matchingPods := common.FilterPodsByOwnerReference(self.Namespace, self.UID(), allPods)
	podInfo := common.GetPodInfo(self.Status.Replicas, *self.Spec.Replicas, matchingPods)
	podInfo.Warnings = event.GetPodsEventWarnings(allEvents, matchingPods)

	return ResourceOwner{
		TypeMeta:        api.NewTypeMeta(api.ResourceKindReplicaSet),
		ObjectMeta:      api.NewObjectMeta(self.ObjectMeta),
		Pods:            podInfo,
		ContainerImages: common.GetContainerImages(&self.Spec.Template.Spec),
	}
}

// UID is an implementation of UID method from ResourceController interface.
func (self ReplicaSetController) UID() types.UID {
	return extensions.ReplicaSet(self).UID
}

// GetLogSources is an implementation of the GetLogSources method from ResourceController interface.
func (self ReplicaSetController) GetLogSources(k8sClient *client.Clientset) LogSources {
	return LogSources{
		PodNames:       getPodNames(k8sClient, self.Namespace, self.UID()),
		ContainerNames: common.GetContainerNames(&self.Spec.Template.Spec),
	}
}

// ReplicationControllerController is an alias-type for Kubernetes API Replication Controller type.
// It allows to provide custom set of functions for already existing type.
type ReplicationControllerController v1.ReplicationController

// Get is an implementation of Get method from ResourceController interface.
func (self ReplicationControllerController) Get(allPods []v1.Pod,
	allEvents []v1.Event) ResourceOwner {
	matchingPods := common.FilterPodsByOwnerReference(self.Namespace, self.UID(), allPods)
	podInfo := common.GetPodInfo(self.Status.Replicas, *self.Spec.Replicas, matchingPods)
	podInfo.Warnings = event.GetPodsEventWarnings(allEvents, matchingPods)

	return ResourceOwner{
		TypeMeta:        api.NewTypeMeta(api.ResourceKindReplicationController),
		ObjectMeta:      api.NewObjectMeta(self.ObjectMeta),
		Pods:            podInfo,
		ContainerImages: common.GetContainerImages(&self.Spec.Template.Spec),
	}
}

// UID is an implementation of UID method from ResourceController interface.
func (self ReplicationControllerController) UID() types.UID {
	return v1.ReplicationController(self).UID
}

// GetLogSources is an implementation of the GetLogSources method from ResourceController interface.
func (self ReplicationControllerController) GetLogSources(k8sClient *client.Clientset) LogSources {
	return LogSources{
		PodNames:       getPodNames(k8sClient, self.Namespace, self.UID()),
		ContainerNames: common.GetContainerNames(&self.Spec.Template.Spec),
	}
}

// DaemonSetController is an alias-type for Kubernetes API Daemon Set type. It allows to provide
// custom set of functions for already existing type.
type DaemonSetController extensions.DaemonSet

// Get is an implementation of Get method from ResourceController interface.
func (self DaemonSetController) Get(allPods []v1.Pod, allEvents []v1.Event) ResourceOwner {
	matchingPods := common.FilterPodsByOwnerReference(self.Namespace, self.UID(), allPods)
	podInfo := common.GetPodInfo(self.Status.CurrentNumberScheduled,
		self.Status.DesiredNumberScheduled, matchingPods)
	podInfo.Warnings = event.GetPodsEventWarnings(allEvents, matchingPods)

	return ResourceOwner{
		TypeMeta:        api.NewTypeMeta(api.ResourceKindDaemonSet),
		ObjectMeta:      api.NewObjectMeta(self.ObjectMeta),
		Pods:            podInfo,
		ContainerImages: common.GetContainerImages(&self.Spec.Template.Spec),
	}
}

// UID is an implementation of UID method from ResourceController interface.
func (self DaemonSetController) UID() types.UID {
	return extensions.DaemonSet(self).UID
}

// GetLogSources is an implementation of the GetLogSources method from ResourceController interface.
func (self DaemonSetController) GetLogSources(k8sClient *client.Clientset) LogSources {
	return LogSources{
		PodNames:       getPodNames(k8sClient, self.Namespace, self.UID()),
		ContainerNames: common.GetContainerNames(&self.Spec.Template.Spec),
	}
}

// StatefulSetController is an alias-type for Kubernetes API Stateful Set type. It allows to provide
// custom set of functions for already existing type.
type StatefulSetController apps.StatefulSet

// Get is an implementation of Get method from ResourceController interface.
func (self StatefulSetController) Get(allPods []v1.Pod, allEvents []v1.Event) ResourceOwner {
	matchingPods := common.FilterPodsByOwnerReference(self.Namespace, self.UID(), allPods)
	podInfo := common.GetPodInfo(self.Status.Replicas, *self.Spec.Replicas, matchingPods)
	podInfo.Warnings = event.GetPodsEventWarnings(allEvents, matchingPods)

	return ResourceOwner{
		TypeMeta:        api.NewTypeMeta(api.ResourceKindStatefulSet),
		ObjectMeta:      api.NewObjectMeta(self.ObjectMeta),
		Pods:            podInfo,
		ContainerImages: common.GetContainerImages(&self.Spec.Template.Spec),
	}
}

// UID is an implementation of UID method from ResourceController interface.
func (self StatefulSetController) UID() types.UID {
	return apps.StatefulSet(self).UID
}

// GetLogSources is an implementation of the GetLogSources method from ResourceController interface.
func (self StatefulSetController) GetLogSources(k8sClient *client.Clientset) LogSources {
	return LogSources{
		PodNames:       getPodNames(k8sClient, self.Namespace, self.UID()),
		ContainerNames: common.GetContainerNames(&self.Spec.Template.Spec),
	}
}

func getPodNames(k8sClient *client.Clientset, namespace string, uid types.UID) []string {
	allPods, _ := k8sClient.CoreV1().Pods(namespace).List(listEverything)
	matchingPods := common.FilterPodsByOwnerReference(namespace, uid, allPods.Items)
	names := make([]string, 0)
	for _, pod := range matchingPods {
		names = append(names, pod.Name)
	}
	return names
}
