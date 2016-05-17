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

	"github.com/kubernetes/dashboard/client"
	"github.com/kubernetes/dashboard/resource/common"
)

// PodDetail is a presentation layer view of Kubernetes PodDetail resource.
// This means it is PodDetail plus additional augumented data we can get
// from other sources (like services that target it).
type PodDetail struct {
	ObjectMeta      common.ObjectMeta `json:"objectMeta"`
	TypeMeta        common.TypeMeta   `json:"typeMeta"`

	// Container images of the Pod.
	ContainerImages []string `json:"containerImages"`

	// Status of the Pod. See Kubernetes API for reference.
	PodPhase        api.PodPhase `json:"podPhase"`

	// IP address of the Pod.
	PodIP           string `json:"podIP"`

	// Name of the Node this Pod runs on.
	NodeName        string `json:"nodeName"`

	// Count of containers restarts.
	RestartCount    int `json:"restartCount"`

	// Pod metrics.
	Metrics         *PodMetrics `json:"metrics"`
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

	podDetail := ToPodDetail(pod, metrics)
	return &podDetail, nil
};
