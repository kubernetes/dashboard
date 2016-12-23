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

package pod

import (
	"encoding/json"
	"log"

	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/apis/apps"
	"k8s.io/kubernetes/pkg/apis/batch"
	"k8s.io/kubernetes/pkg/apis/extensions"
	k8sClient "k8s.io/kubernetes/pkg/client/clientset_generated/internalclientset"

	"github.com/kubernetes/dashboard/src/app/backend/client"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/daemonset/daemonsetlist"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/job/joblist"
	"github.com/kubernetes/dashboard/src/app/backend/resource/metric"
	"github.com/kubernetes/dashboard/src/app/backend/resource/replicaset/replicasetlist"
	"github.com/kubernetes/dashboard/src/app/backend/resource/replicationcontroller/replicationcontrollerlist"
	"github.com/kubernetes/dashboard/src/app/backend/resource/statefulset/statefulsetlist"
)

// PodDetail is a presentation layer view of Kubernetes PodDetail resource.
// This means it is PodDetail plus additional augmented data we can get
// from other sources (like services that target it).
type PodDetail struct {
	ObjectMeta common.ObjectMeta `json:"objectMeta"`
	TypeMeta   common.TypeMeta   `json:"typeMeta"`

	// Status of the Pod. See Kubernetes API for reference.
	PodPhase api.PodPhase `json:"podPhase"`

	// IP address of the Pod.
	PodIP string `json:"podIP"`

	// Name of the Node this Pod runs on.
	NodeName string `json:"nodeName"`

	// Count of containers restarts.
	RestartCount int32 `json:"restartCount"`

	// Reference to the Controller
	Controller Controller `json:"controller"`

	// List of container of this pod.
	Containers []Container `json:"containers"`

	// Metrics collected for this resource
	Metrics []metric.Metric `json:"metrics"`

	// Conditions of this pod.
	Conditions []common.Condition `json:"conditions"`
}

// Creator is a view of the creator of a given pod, in List for for ease of use
// in the frontend logic.
//
// Has 'oneof' semantics on the non-Kind fields decided by which Kind is there
type Controller struct {
	// Kind of the Controller, will also define wich of the other members will be non nil
	Kind string `json:"kind"`

	// Singleton list of the Job that controls this Pod, only set if Kind = "Job"
	JobList *joblist.JobList `json:"joblist,omitempty"`

	ReplicaSetList            *replicasetlist.ReplicaSetList                       `json:"replicasetlist,omitempty"`
	ReplicationControllerList *replicationcontrollerlist.ReplicationControllerList `json:"replicationcontrollerlist,omitempty"`
	DaemonSetList             *daemonsetlist.DaemonSetList                         `json:"daemonsetlist,omitempty"`
	StatefulSetList           *statefulsetlist.StatefulSetList                     `json:"statefulsetlist,omitempty"`
}

// Container represents a docker/rkt/etc. container that lives in a pod.
type Container struct {
	// Name of the container.
	Name string `json:"name"`

	// Image URI of the container.
	Image string `json:"image"`

	// List of environment variables.
	Env []EnvVar `json:"env"`

	// Commands of the container
	Commands []string `json:"commands"`

	// Command arguments
	Args []string `json:"args"`
}

// EnvVar represents an environment variable of a container.
type EnvVar struct {
	// Name of the variable.
	Name string `json:"name"`

	// Value of the variable. May be empty if value from is defined.
	Value string `json:"value"`

	// Defined for derived variables. If non-null, the value is get from the reference.
	// Note that this is an API struct. This is intentional, as EnvVarSources are plain struct
	// references.
	ValueFrom *api.EnvVarSource `json:"valueFrom"`
}

// GetPodDetail returns the details (PodDetail) of a named Pod from a particular
// namespace.
func GetPodDetail(client k8sClient.Interface, heapsterClient client.HeapsterClient,
	namespace, name string) (*PodDetail, error) {

	log.Printf("Getting details of %s pod in %s namespace", name, namespace)

	channels := &common.ResourceChannels{
		ConfigMapList: common.GetConfigMapListChannel(client, common.NewSameNamespaceQuery(namespace), 1),
		PodMetrics:    common.GetPodMetricsChannel(heapsterClient, name, namespace),
	}

	pod, err := client.Core().Pods(namespace).Get(name)

	if err != nil {
		return nil, err
	}

	controller := Controller{
		Kind: "unknown",
	}
	creatorAnnotation, found := pod.ObjectMeta.Annotations[api.CreatedByAnnotation]
	if found {
		creatorRef, err := getPodCreator(client, creatorAnnotation, common.NewSameNamespaceQuery(namespace), heapsterClient)
		if err != nil {
			return nil, err
		}
		controller = *creatorRef
	}

	// Download metrics
	_, metricPromises := dataselect.GenericDataSelectWithMetrics(toCells([]api.Pod{*pod}),
		dataselect.StdMetricsDataSelect, dataselect.NoResourceCache, &heapsterClient)
	metrics, _ := metricPromises.GetMetrics()

	if err = <-channels.ConfigMapList.Error; err != nil {
		return nil, err
	}
	configMapList := <-channels.ConfigMapList.List

	podDetail := toPodDetail(pod, metrics, configMapList, controller)
	return &podDetail, nil
}

func getPodCreator(client k8sClient.Interface, creatorAnnotation string, nsQuery *common.NamespaceQuery, heapsterClient client.HeapsterClient) (*Controller, error) {
	var serializedReference api.SerializedReference
	err := json.Unmarshal([]byte(creatorAnnotation), &serializedReference)
	if err != nil {
		return nil, err
	}

	channels := &common.ResourceChannels{
		PodList:   common.GetPodListChannel(client, nsQuery, 1),
		EventList: common.GetEventListChannel(client, nsQuery, 1),
	}
	pods := <-channels.PodList.List
	if err := <-channels.PodList.Error; err != nil {
		return nil, err
	}

	events := <-channels.EventList.List
	if err := <-channels.EventList.Error; err != nil {
		return nil, err
	}
	reference := serializedReference.Reference
	return toPodController(client, reference, pods.Items, events.Items, heapsterClient)
}

func toPodController(client k8sClient.Interface, reference api.ObjectReference, pods []api.Pod, events []api.Event, heapsterClient client.HeapsterClient) (*Controller, error) {
	kind := reference.Kind
	switch kind {
	case "Job":
		return toJobPodController(client, reference, pods, events, heapsterClient)
	case "ReplicaSet":
		return toReplicaSetPodController(client, reference, pods, events, heapsterClient)
	case "ReplicationController":
		return toReplicationControllerPodController(client, reference, pods, events, heapsterClient)
	case "DaemonSet":
		return toDaemonSetPodController(client, reference, pods, events, heapsterClient)
	case "StatefulSet":
		return toStatefulSetPodController(client, reference, pods, events, heapsterClient)
	default:
	}
	// Will be moved into the default case once all cases are implemented
	return &Controller{
		Kind: kind,
	}, nil
}

func toJobPodController(client k8sClient.Interface, reference api.ObjectReference, pods []api.Pod, events []api.Event, heapsterClient client.HeapsterClient) (*Controller, error) {
	job, err := client.Batch().Jobs(reference.Namespace).Get(reference.Name)
	if err != nil {
		return nil, err
	}
	jobs := []batch.Job{*job}
	jobList := joblist.CreateJobList(jobs, pods, events, dataselect.StdMetricsDataSelect, &heapsterClient)
	return &Controller{
		Kind:    "Job",
		JobList: jobList,
	}, nil
}

func toReplicaSetPodController(client k8sClient.Interface, reference api.ObjectReference, pods []api.Pod, events []api.Event, heapsterClient client.HeapsterClient) (*Controller, error) {
	rs, err := client.Extensions().ReplicaSets(reference.Namespace).Get(reference.Name)
	if err != nil {
		return nil, err
	}
	replicaSets := []extensions.ReplicaSet{*rs}
	replicaSetList := replicasetlist.CreateReplicaSetList(replicaSets, pods, events, dataselect.StdMetricsDataSelect, &heapsterClient)
	return &Controller{
		Kind:           "ReplicaSet",
		ReplicaSetList: replicaSetList,
	}, nil
}

func toReplicationControllerPodController(client k8sClient.Interface, reference api.ObjectReference, pods []api.Pod, events []api.Event, heapsterClient client.HeapsterClient) (*Controller, error) {
	rc, err := client.Core().ReplicationControllers(reference.Namespace).Get(reference.Name)
	if err != nil {
		return nil, err
	}
	rcs := []api.ReplicationController{*rc}
	replicationControllerList := replicationcontrollerlist.CreateReplicationControllerList(rcs, dataselect.StdMetricsDataSelect, pods, events, &heapsterClient)
	return &Controller{
		Kind: "ReplicationController",
		ReplicationControllerList: replicationControllerList,
	}, nil
}

func toDaemonSetPodController(client k8sClient.Interface, reference api.ObjectReference, pods []api.Pod, events []api.Event, heapsterClient client.HeapsterClient) (*Controller, error) {
	daemonset, err := client.Extensions().DaemonSets(reference.Namespace).Get(reference.Name)
	if err != nil {
		return nil, err
	}
	daemonsets := []extensions.DaemonSet{*daemonset}

	daemonSetList := daemonsetlist.CreateDaemonSetList(daemonsets, pods, events, dataselect.StdMetricsDataSelect, &heapsterClient)
	return &Controller{
		Kind:          "DaemonSet",
		DaemonSetList: daemonSetList,
	}, nil
}

func toStatefulSetPodController(client k8sClient.Interface, reference api.ObjectReference, pods []api.Pod, events []api.Event, heapsterClient client.HeapsterClient) (*Controller, error) {
	statefulset, err := client.Apps().StatefulSets(reference.Namespace).Get(reference.Name)
	if err != nil {
		return nil, err
	}
	statefulsets := []apps.StatefulSet{*statefulset}

	statefulSetList := statefulsetlist.CreateStatefulSetList(statefulsets, pods, events, dataselect.StdMetricsDataSelect, &heapsterClient)
	return &Controller{
		Kind:            "StatefulSet",
		StatefulSetList: statefulSetList,
	}, nil
}

func toPodDetail(pod *api.Pod, metrics []metric.Metric, configMaps *api.ConfigMapList, controller Controller) PodDetail {

	containers := make([]Container, 0)
	for _, container := range pod.Spec.Containers {
		vars := make([]EnvVar, 0)
		for _, envVar := range container.Env {
			variable := EnvVar{
				Name:      envVar.Name,
				Value:     envVar.Value,
				ValueFrom: envVar.ValueFrom,
			}
			if variable.ValueFrom != nil {
				variable.Value = evalValueFrom(variable.ValueFrom, configMaps)
			}
			vars = append(vars, variable)
		}
		containers = append(containers, Container{
			Name:     container.Name,
			Image:    container.Image,
			Env:      vars,
			Commands: container.Command,
			Args:     container.Args,
		})
	}
	podDetail := PodDetail{
		ObjectMeta:   common.NewObjectMeta(pod.ObjectMeta),
		TypeMeta:     common.NewTypeMeta(common.ResourceKindPod),
		PodPhase:     pod.Status.Phase,
		PodIP:        pod.Status.PodIP,
		RestartCount: getRestartCount(*pod),
		NodeName:     pod.Spec.NodeName,
		Controller:   controller,
		Containers:   containers,
		Metrics:      metrics,
		Conditions:   getPodConditions(*pod),
	}

	return podDetail
}

func evalValueFrom(src *api.EnvVarSource, configMaps *api.ConfigMapList) string {
	if src.ConfigMapKeyRef != nil {
		name := src.ConfigMapKeyRef.LocalObjectReference.Name

		for _, configMap := range configMaps.Items {
			if configMap.ObjectMeta.Name == name {
				return configMap.Data[src.ConfigMapKeyRef.Key]
			}
		}
	}
	return ""
}
