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

package node

import (
	"log"

	"github.com/kubernetes/dashboard/src/app/backend/client"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/event"
	"github.com/kubernetes/dashboard/src/app/backend/resource/metric"
	"github.com/kubernetes/dashboard/src/app/backend/resource/pod"
	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/api/resource"
	k8sClient "k8s.io/kubernetes/pkg/client/clientset_generated/internalclientset"
	"k8s.io/kubernetes/pkg/fields"
)

// NodeAllocatedResources describes node allocated resources.
type NodeAllocatedResources struct {
	// CPURequests is number of allocated milicores.
	CPURequests int64 `json:"cpuRequests"`

	// CPURequestsFraction is a fraction of CPU, that is allocated.
	CPURequestsFraction float64 `json:"cpuRequestsFraction"`

	// CPULimits is defined CPU limit.
	CPULimits int64 `json:"cpuLimits"`

	// CPULimitsFraction is a fraction of defined CPU limit, can be over 100%, i.e.
	// overcommitted.
	CPULimitsFraction float64 `json:"cpuLimitsFraction"`

	// CPUCapacity is specified node CPU capacity in milicores.
	CPUCapacity int64 `json:"cpuCapacity"`

	// MemoryRequests is a fraction of memory, that is allocated.
	MemoryRequests int64 `json:"memoryRequests"`

	// MemoryRequestsFraction is a fraction of memory, that is allocated.
	MemoryRequestsFraction float64 `json:"memoryRequestsFraction"`

	// MemoryLimits is defined memory limit.
	MemoryLimits int64 `json:"memoryLimits"`

	// MemoryLimitsFraction is a fraction of defined memory limit, can be over 100%, i.e.
	// overcommitted.
	MemoryLimitsFraction float64 `json:"memoryLimitsFraction"`

	// MemoryCapacity is specified node memory capacity in bytes.
	MemoryCapacity int64 `json:"memoryCapacity"`

	// AllocatedPods in number of currently allocated pods on the node.
	AllocatedPods int `json:"allocatedPods"`

	// PodCapacity is maximum number of pods, that can be allocated on the node.
	PodCapacity int64 `json:"podCapacity"`
}

// NodeDetail is a presentation layer view of Kubernetes Node resource. This means it is Node plus
// additional augmented data we can get from other sources.
type NodeDetail struct {
	ObjectMeta common.ObjectMeta `json:"objectMeta"`
	TypeMeta   common.TypeMeta   `json:"typeMeta"`

	// NodePhase is the current lifecycle phase of the node.
	Phase api.NodePhase `json:"phase"`

	// Resources allocated by node.
	AllocatedResources NodeAllocatedResources `json:"allocatedResources"`

	// External ID of the node assigned by some machine database (e.g. a cloud provider).
	ExternalID string `json:"externalID"`

	// PodCIDR represents the pod IP range assigned to the node.
	PodCIDR string `json:"podCIDR"`

	// ID of the node assigned by the cloud provider.
	ProviderID string `json:"providerID"`

	// Unschedulable controls node schedulability of new pods. By default node is schedulable.
	Unschedulable bool `json:"unschedulable"`

	// Set of ids/uuids to uniquely identify the node.
	NodeInfo api.NodeSystemInfo `json:"nodeInfo"`

	// Conditions is an array of current node conditions.
	Conditions []common.Condition `json:"conditions"`

	// Container images of the node.
	ContainerImages []string `json:"containerImages"`

	// PodList contains information about pods belonging to this node.
	PodList pod.PodList `json:"podList"`

	// Events is list of events associated to the node.
	EventList common.EventList `json:"eventList"`

	// Metrics collected for this resource
	Metrics []metric.Metric `json:"metrics"`
}

// GetNodeDetail gets node details.
func GetNodeDetail(client k8sClient.Interface, heapsterClient client.HeapsterClient, name string) (*NodeDetail, error) {
	log.Printf("Getting details of %s node", name)

	node, err := client.Core().Nodes().Get(name)
	if err != nil {
		return nil, err
	}

	// Download standard metrics. Currently metrics are hard coded, but it is possible to replace
	// dataselect.StdMetricsDataSelect with data select provided in the request.
	_, metricPromises := dataselect.GenericDataSelectWithMetrics(toCells([]api.Node{*node}),
		dataselect.StdMetricsDataSelect,
		dataselect.NoResourceCache, &heapsterClient)

	pods, err := getNodePods(client, *node)
	if err != nil {
		return nil, err
	}

	podList, err := GetNodePods(client, heapsterClient, dataselect.DefaultDataSelect, name)

	eventList, err := event.GetNodeEvents(client, dataselect.DefaultDataSelect, node.Name)
	if err != nil {
		return nil, err
	}

	allocatedResources, err := getNodeAllocatedResources(*node, pods)
	if err != nil {
		return nil, err
	}

	metrics, _ := metricPromises.GetMetrics()
	nodeDetails := toNodeDetail(*node, podList, eventList, allocatedResources, metrics)
	return &nodeDetails, nil
}

func getNodeAllocatedResources(node api.Node, podList *api.PodList) (NodeAllocatedResources, error) {
	reqs, limits := map[api.ResourceName]resource.Quantity{}, map[api.ResourceName]resource.Quantity{}

	for _, pod := range podList.Items {
		podReqs, podLimits, err := api.PodRequestsAndLimits(&pod)
		if err != nil {
			return NodeAllocatedResources{}, err
		}
		for podReqName, podReqValue := range podReqs {
			if value, ok := reqs[podReqName]; !ok {
				reqs[podReqName] = *podReqValue.Copy()
			} else {
				value.Add(podReqValue)
				reqs[podReqName] = value
			}
		}
		for podLimitName, podLimitValue := range podLimits {
			if value, ok := limits[podLimitName]; !ok {
				limits[podLimitName] = *podLimitValue.Copy()
			} else {
				value.Add(podLimitValue)
				limits[podLimitName] = value
			}
		}
	}

	cpuRequests, cpuLimits, memoryRequests, memoryLimits := reqs[api.ResourceCPU],
		limits[api.ResourceCPU], reqs[api.ResourceMemory], limits[api.ResourceMemory]

	var cpuRequestsFraction, cpuLimitsFraction float64 = 0, 0
	if capacity := float64(node.Status.Capacity.Cpu().MilliValue()); capacity > 0 {
		cpuRequestsFraction = float64(cpuRequests.MilliValue()) / capacity * 100
		cpuLimitsFraction = float64(cpuLimits.MilliValue()) / capacity * 100
	}

	var memoryRequestsFraction, memoryLimitsFraction float64 = 0, 0
	if capacity := float64(node.Status.Capacity.Memory().MilliValue()); capacity > 0 {
		memoryRequestsFraction = float64(memoryRequests.MilliValue()) / capacity * 100
		memoryLimitsFraction = float64(memoryLimits.MilliValue()) / capacity * 100
	}

	return NodeAllocatedResources{
		CPURequests:            cpuRequests.MilliValue(),
		CPURequestsFraction:    cpuRequestsFraction,
		CPULimits:              cpuLimits.MilliValue(),
		CPULimitsFraction:      cpuLimitsFraction,
		CPUCapacity:            node.Status.Capacity.Cpu().MilliValue(),
		MemoryRequests:         memoryRequests.Value(),
		MemoryRequestsFraction: memoryRequestsFraction,
		MemoryLimits:           memoryLimits.Value(),
		MemoryLimitsFraction:   memoryLimitsFraction,
		MemoryCapacity:         node.Status.Capacity.Memory().Value(),
		AllocatedPods:          len(podList.Items),
		PodCapacity:            node.Status.Capacity.Pods().Value(),
	}, nil
}

func GetNodePods(client k8sClient.Interface, heapsterClient client.HeapsterClient, dsQuery *dataselect.DataSelectQuery, name string) (*pod.PodList, error) {
	node, err := client.Core().Nodes().Get(name)
	if err != nil {
		return nil, err
	}

	pods, err := getNodePods(client, *node)
	if err != nil {
		return nil, err
	}

	podList := pod.CreatePodList(pods.Items, []api.Event{}, dsQuery, heapsterClient)
	return &podList, nil
}

func getNodePods(client k8sClient.Interface, node api.Node) (*api.PodList, error) {
	fieldSelector, err := fields.ParseSelector("spec.nodeName=" + node.Name +
		",status.phase!=" + string(api.PodSucceeded) +
		",status.phase!=" + string(api.PodFailed))

	if err != nil {
		return nil, err
	}

	return client.Core().Pods(api.NamespaceAll).List(api.ListOptions{
		FieldSelector: fieldSelector,
	})
}

func toNodeDetail(node api.Node, pods *pod.PodList, eventList *common.EventList,
	allocatedResources NodeAllocatedResources, metrics []metric.Metric) NodeDetail {

	return NodeDetail{
		ObjectMeta:         common.NewObjectMeta(node.ObjectMeta),
		TypeMeta:           common.NewTypeMeta(common.ResourceKindNode),
		Phase:              node.Status.Phase,
		ExternalID:         node.Spec.ExternalID,
		ProviderID:         node.Spec.ProviderID,
		PodCIDR:            node.Spec.PodCIDR,
		Unschedulable:      node.Spec.Unschedulable,
		NodeInfo:           node.Status.NodeInfo,
		Conditions:         getNodeConditions(node),
		ContainerImages:    getContainerImages(node),
		PodList:            *pods,
		EventList:          *eventList,
		AllocatedResources: allocatedResources,
		Metrics:            metrics,
	}
}
