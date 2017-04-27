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

package owner

import (
	"fmt"

	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/event"
	meta "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	api "k8s.io/client-go/pkg/api/v1"
	apps "k8s.io/client-go/pkg/apis/apps/v1beta1"
	batch "k8s.io/client-go/pkg/apis/batch/v1"
	extensions "k8s.io/client-go/pkg/apis/extensions/v1beta1"
)

// ResourceOwner is an structure representing resource owner, it may be Replication Controller,
// Daemon Set, Job etc.
type ResourceOwner struct {
	ObjectMeta      common.ObjectMeta `json:"objectMeta"`
	TypeMeta        common.TypeMeta   `json:"typeMeta"`
	Pods            common.PodInfo    `json:"pods"`
	ContainerImages []string          `json:"containerImages"`
}

// ResourceController is an interface, that allows to perform operations on resource controller. To
// instantiate it use NewResourceController and pass object reference to it. It may be extended to
// provide more detailed set of functions.
type ResourceController interface {
	// Get is a method, that returns ResourceOwner object.
	Get(allPods []api.Pod, allEvents []api.Event) ResourceOwner
}

// NewResourceController creates instance of ResourceController based on given reference. It allows
// to convert owner/created by references to real objects.
func NewResourceController(reference api.ObjectReference, client kubernetes.Interface) (
	ResourceController, error) {
	switch reference.Kind {
	case "Job":
		job, err := client.BatchV1().Jobs(reference.Namespace).Get(reference.Name,
			meta.GetOptions{})
		if err != nil {
			return nil, err
		}
		return JobController(*job), nil
	case "ReplicaSet":
		rs, err := client.ExtensionsV1beta1().ReplicaSets(reference.Namespace).Get(reference.Name,
			meta.GetOptions{})
		if err != nil {
			return nil, err
		}
		return ReplicaSetController(*rs), nil
	case "ReplicationController":
		rc, err := client.CoreV1().ReplicationControllers(reference.Namespace).Get(
			reference.Name, meta.GetOptions{})
		if err != nil {
			return nil, err
		}
		return ReplicationControllerController(*rc), nil
	case "DaemonSet":
		ds, err := client.ExtensionsV1beta1().DaemonSets(reference.Namespace).Get(reference.Name,
			meta.GetOptions{})
		if err != nil {
			return nil, err
		}
		return DaemonSetController(*ds), nil
	case "StatefulSet":
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
func (self JobController) Get(allPods []api.Pod, allEvents []api.Event) ResourceOwner {
	matchingPods := common.FilterPodsByOwnerReference(self.Namespace, self.UID, allPods)
	var completions int32
	if self.Spec.Completions != nil {
		completions = *self.Spec.Completions
	}
	podInfo := common.GetPodInfo(self.Status.Active, completions, matchingPods)
	podInfo.Warnings = event.GetPodsEventWarnings(allEvents, matchingPods)

	return ResourceOwner{
		TypeMeta:        common.NewTypeMeta(common.ResourceKindJob),
		ObjectMeta:      common.NewObjectMeta(self.ObjectMeta),
		Pods:            podInfo,
		ContainerImages: common.GetContainerImages(&self.Spec.Template.Spec),
	}
}

// ReplicaSetController is an alias-type for Kubernetes API Replica Set type. It allows to provide
// custom set of functions for already existing type.
type ReplicaSetController extensions.ReplicaSet

// Get is an implementation of Get method from ResourceController interface.
func (self ReplicaSetController) Get(allPods []api.Pod, allEvents []api.Event) ResourceOwner {
	matchingPods := common.FilterPodsByOwnerReference(self.Namespace, self.UID, allPods)
	podInfo := common.GetPodInfo(self.Status.Replicas, *self.Spec.Replicas, matchingPods)
	podInfo.Warnings = event.GetPodsEventWarnings(allEvents, matchingPods)

	return ResourceOwner{
		TypeMeta:        common.NewTypeMeta(common.ResourceKindReplicaSet),
		ObjectMeta:      common.NewObjectMeta(self.ObjectMeta),
		Pods:            podInfo,
		ContainerImages: common.GetContainerImages(&self.Spec.Template.Spec),
	}
}

// ReplicationControllerController is an alias-type for Kubernetes API Replication Controller type.
// It allows to provide custom set of functions for already existing type.
type ReplicationControllerController api.ReplicationController

// Get is an implementation of Get method from ResourceController interface.
func (self ReplicationControllerController) Get(allPods []api.Pod,
	allEvents []api.Event) ResourceOwner {
	matchingPods := common.FilterPodsByOwnerReference(self.Namespace, self.UID, allPods)
	podInfo := common.GetPodInfo(self.Status.Replicas, *self.Spec.Replicas, matchingPods)
	podInfo.Warnings = event.GetPodsEventWarnings(allEvents, matchingPods)

	return ResourceOwner{
		TypeMeta:        common.NewTypeMeta(common.ResourceKindReplicationController),
		ObjectMeta:      common.NewObjectMeta(self.ObjectMeta),
		Pods:            podInfo,
		ContainerImages: common.GetContainerImages(&self.Spec.Template.Spec),
	}
}

// DaemonSetController is an alias-type for Kubernetes API Daemon Set type. It allows to provide
// custom set of functions for already existing type.
type DaemonSetController extensions.DaemonSet

// Get is an implementation of Get method from ResourceController interface.
func (self DaemonSetController) Get(allPods []api.Pod, allEvents []api.Event) ResourceOwner {
	matchingPods := common.FilterPodsByOwnerReference(self.Namespace, self.UID, allPods)
	podInfo := common.GetPodInfo(self.Status.CurrentNumberScheduled,
		self.Status.DesiredNumberScheduled, matchingPods)
	podInfo.Warnings = event.GetPodsEventWarnings(allEvents, matchingPods)

	return ResourceOwner{
		TypeMeta:        common.NewTypeMeta(common.ResourceKindDaemonSet),
		ObjectMeta:      common.NewObjectMeta(self.ObjectMeta),
		Pods:            podInfo,
		ContainerImages: common.GetContainerImages(&self.Spec.Template.Spec),
	}
}

// StatefulSetController is an alias-type for Kubernetes API Stateful Set type. It allows to provide
// custom set of functions for already existing type.
type StatefulSetController apps.StatefulSet

// Get is an implementation of Get method from ResourceController interface.
func (self StatefulSetController) Get(allPods []api.Pod, allEvents []api.Event) ResourceOwner {
	matchingPods := common.FilterPodsByOwnerReference(self.Namespace, self.UID, allPods)
	podInfo := common.GetPodInfo(self.Status.Replicas, *self.Spec.Replicas, matchingPods)
	podInfo.Warnings = event.GetPodsEventWarnings(allEvents, matchingPods)

	return ResourceOwner{
		TypeMeta:        common.NewTypeMeta(common.ResourceKindStatefulSet),
		ObjectMeta:      common.NewObjectMeta(self.ObjectMeta),
		Pods:            podInfo,
		ContainerImages: common.GetContainerImages(&self.Spec.Template.Spec),
	}
}
