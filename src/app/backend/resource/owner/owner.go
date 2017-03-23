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
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	meta "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	api "k8s.io/client-go/pkg/api/v1"
	apps "k8s.io/client-go/pkg/apis/apps/v1beta1"
	batch "k8s.io/client-go/pkg/apis/batch/v1"
	extensions "k8s.io/client-go/pkg/apis/extensions/v1beta1"
)

type ResourceOwner struct {
	ObjectMeta common.ObjectMeta `json:"objectMeta"`
	TypeMeta   common.TypeMeta   `json:"typeMeta"`
	Pods       common.PodInfo
	Images     []string
}

type ResourceController interface {
	Get(allPods []api.Pod) ResourceOwner
}

func NewResourceController(reference api.ObjectReference, client kubernetes.Interface) (ResourceController, error) {
	switch reference.Kind {
	case "Job":
		job, err := client.Batch().Jobs(reference.Namespace).Get(reference.Name, meta.GetOptions{})
		if err != nil {
			return nil, err
		}
		return JobController(*job), nil
	case "ReplicaSet":
		rs, err := client.Extensions().ReplicaSets(reference.Namespace).Get(reference.Name, meta.GetOptions{})
		if err != nil {
			return nil, err
		}
		return ReplicaSetController(*rs), nil
	case "ReplicationController":
		rc, err := client.Core().ReplicationControllers(reference.Namespace).Get(reference.Name, meta.GetOptions{})
		if err != nil {
			return nil, err
		}
		return ReplicationControllerController(*rc), nil
	case "DaemonSet":
		ds, err := client.Extensions().DaemonSets(reference.Namespace).Get(reference.Name, meta.GetOptions{})
		if err != nil {
			return nil, err
		}
		return DaemonSetController(*ds), nil
	case "StatefulSet":
		ss, err := client.Apps().StatefulSets(reference.Namespace).Get(reference.Name, meta.GetOptions{})
		if err != nil {
			return nil, err
		}
		return StatefulSetController(*ss), nil
	default:
		return nil, nil
	}
}

type JobController batch.Job

func (self JobController) Get(allPods []api.Pod) ResourceOwner {
	matchingPods := common.FilterNamespacedPodsBySelector(allPods, self.ObjectMeta.Namespace,
		self.Spec.Selector.MatchLabels)
	var completions int32
	if self.Spec.Completions != nil {
		completions = *self.Spec.Completions
	}
	podInfo := common.GetPodInfo(self.Status.Active, completions, matchingPods)

	return ResourceOwner{
		TypeMeta:   common.NewTypeMeta(common.ResourceKindJob),
		ObjectMeta: common.NewObjectMeta(self.ObjectMeta),
		Pods:       podInfo,
		Images:     common.GetContainerImages(&self.Spec.Template.Spec),
	}
}

type ReplicaSetController extensions.ReplicaSet

func (self ReplicaSetController) Get(allPods []api.Pod) ResourceOwner {
	return ResourceOwner{
		TypeMeta:   common.NewTypeMeta(common.ResourceKindReplicaSet),
		ObjectMeta: common.NewObjectMeta(self.ObjectMeta),
		Pods:       common.PodInfo{}, // TODO
		Images:     common.GetContainerImages(&self.Spec.Template.Spec),
	}
}

type ReplicationControllerController api.ReplicationController

func (self ReplicationControllerController) Get(allPods []api.Pod) ResourceOwner {
	return ResourceOwner{
		TypeMeta:   common.NewTypeMeta(common.ResourceKindReplicationController),
		ObjectMeta: common.NewObjectMeta(self.ObjectMeta),
		Pods:       common.PodInfo{}, // TODO
		Images:     common.GetContainerImages(&self.Spec.Template.Spec),
	}
}

type DaemonSetController extensions.DaemonSet

func (self DaemonSetController) Get(allPods []api.Pod) ResourceOwner {
	return ResourceOwner{
		TypeMeta:   common.NewTypeMeta(common.ResourceKindDaemonSet),
		ObjectMeta: common.NewObjectMeta(self.ObjectMeta),
		Pods:       common.PodInfo{}, // TODO
		Images:     common.GetContainerImages(&self.Spec.Template.Spec),
	}
}

type StatefulSetController apps.StatefulSet

func (self StatefulSetController) Get(allPods []api.Pod) ResourceOwner {
	return ResourceOwner{
		TypeMeta:   common.NewTypeMeta(common.ResourceKindStatefulSet),
		ObjectMeta: common.NewObjectMeta(self.ObjectMeta),
		Pods:       common.PodInfo{}, // TODO
		Images:     common.GetContainerImages(&self.Spec.Template.Spec),
	}
}
