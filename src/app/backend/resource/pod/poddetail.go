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
	"k8s.io/kubernetes/pkg/apis/batch"
	k8sClient "k8s.io/kubernetes/pkg/client/unversioned"

	"github.com/kubernetes/dashboard/src/app/backend/client"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/job/joblist"
	"github.com/kubernetes/dashboard/src/app/backend/resource/metric"
)

const (
	CreatedByAnnotation = "kubernetes.io/created-by"
)
// PodDetail is a presentation layer view of Kubernetes PodDetail resource.
// This means it is PodDetail plus additional augumented data we can get
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

	// Reference to the Creator
	Creator Creator `json:"creator"`

	// List of container of this pod.
	Containers []Container `json:"containers"`

	// Metrics collected for this resource
	Metrics []metric.Metric `json:"metrics"`
}

//Creator info, with go flavored void*
type Creator struct {
	Kind string `json:"kind"`

	Payload interface{} `json:"payload"`
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

	pod, err := client.Pods(namespace).Get(name)

	if err != nil {
		return nil, err
	}

	creator := Creator{}
	creatorAnnotation, found := pod.ObjectMeta.Annotations[CreatedByAnnotation]
	if found {
		creatorRef, err := getPodCreator(client, creatorAnnotation, common.NewSameNamespaceQuery(namespace), heapsterClient)
		if (err != nil) {
			return nil, err
		}
		creator = *creatorRef
	}

	// Download metrics
	_, metricPromises := dataselect.GenericDataSelectWithMetrics(toCells([]api.Pod{*pod}),
		dataselect.StdMetricsDataSelect, dataselect.NoResourceCache, &heapsterClient)
	metrics, _ := metricPromises.GetMetrics()

	if err = <-channels.ConfigMapList.Error; err != nil {
		return nil, err
	}
	configMapList := <-channels.ConfigMapList.List

	podDetail := toPodDetail(pod, metrics, configMapList, creator)
	return &podDetail, nil
}

func getPodCreator(client k8sClient.Interface, creatorAnnotation string, nsQuery *common.NamespaceQuery, heapsterClient client.HeapsterClient) (*Creator, error) {
	var serializedReference api.SerializedReference
	err := json.Unmarshal([]byte(creatorAnnotation), &serializedReference);
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
	var name string
	kind := reference.Kind
	switch kind {
	case "Job":
		job, err := client.Extensions().Jobs(reference.Namespace).Get(reference.Name)
		if err != nil {
			return nil, err
		}
		jobs := []batch.Job{*job}
		jobList := joblist.CreateJobList(jobs, pods.Items, events.Items, dataselect.StdMetricsDataSelect, &heapsterClient)
		return &Creator{
			Kind: "Job",
			Payload: jobList,
		}, nil
	case "ReplicaSet":
		name = "Replica Set thingy"
	case "ReplicationController":
		name = "Replication Controller thingy"
	case "DaemonSet":
		name = "Daemon Set thingy"
	case "PetSet":
		name = "Pet Set thingy"
	default:
		name = "unknown"
	}
	return &Creator{
		Kind: kind,
		Payload: name,
	}, nil
}

func toPodDetail(pod *api.Pod, metrics []metric.Metric, configMaps *api.ConfigMapList, creator Creator) PodDetail {

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
		Creator:      creator,
		Containers:   containers,
		Metrics:      metrics,
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
