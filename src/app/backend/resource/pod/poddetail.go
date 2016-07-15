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
	"log"

	"k8s.io/kubernetes/pkg/api"
	k8sClient "k8s.io/kubernetes/pkg/client/unversioned"

	"github.com/kubernetes/dashboard/src/app/backend/client"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
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

	// List of container of this pod.
	Containers []Container `json:"containers"`

	// Pod metrics.
	Metrics *PodMetrics `json:"metrics"`
}

// Container represents a docker/rkt/etc. container that lives in a pod.
type Container struct {
	// Name of the container.
	Name string `json:"name"`

	// Image URI of the container.
	Image string `json:"image"`

	// List of environment variables.
	Env []EnvVar `json:"env"`
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

	// TODO(floreks): Use channels.
	pod, err := client.Pods(namespace).Get(name)
	if err != nil {
		return nil, err
	}

	metrics, err := getPodMetrics([]api.Pod{*pod}, heapsterClient)
	if err != nil {
		log.Printf("Skipping Heapster metrics because of error: %s\n", err)
	}

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
				value, err := evalValueFrom(variable.ValueFrom, client.ConfigMaps(namespace))
				if err != nil {
					return nil, err
				}
				variable.Value = value
			}
			vars = append(vars, variable)
		}
		containers = append(containers, Container{
			Name:  container.Name,
			Image: container.Image,
			Env:   vars,
		})
	}
	podDetail := PodDetail{
		ObjectMeta:   common.NewObjectMeta(pod.ObjectMeta),
		TypeMeta:     common.NewTypeMeta(common.ResourceKindPod),
		PodPhase:     pod.Status.Phase,
		PodIP:        pod.Status.PodIP,
		RestartCount: getRestartCount(*pod),
		NodeName:     pod.Spec.NodeName,
		Containers:   containers,
	}

	if metrics != nil && metrics.MetricsMap[pod.Namespace] != nil {
		metric := metrics.MetricsMap[pod.Namespace][pod.Name]
		podDetail.Metrics = &metric
	}

	return &podDetail, nil
}

func evalValueFrom(src *api.EnvVarSource, configMapClient k8sClient.ConfigMapsInterface) (string, error) {
	if src.ConfigMapKeyRef != nil {
		name := src.ConfigMapKeyRef.LocalObjectReference.Name
		configMap, err := configMapClient.Get(name)

		if err != nil {
			return "", err
		}

		return configMap.Data[src.ConfigMapKeyRef.Key], nil
	}
	return "", nil
}
