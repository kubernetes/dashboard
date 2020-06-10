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

package pod

import (
	"github.com/kubernetes/dashboard/src/app/backend/api"
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/event"
	v1 "k8s.io/api/core/v1"
)

// getRestartCount return the restart count of given pod (total number of its containers restarts).
func getRestartCount(pod v1.Pod) int32 {
	var restartCount int32 = 0
	for _, containerStatus := range pod.Status.ContainerStatuses {
		restartCount += containerStatus.RestartCount
	}
	return restartCount
}

// getPodStatus returns a PodStatus object containing a summary of the pod's status.
func getPodStatus(pod v1.Pod, warnings []common.Event) PodStatus {
	var states []v1.ContainerState
	for _, containerStatus := range pod.Status.ContainerStatuses {
		states = append(states, containerStatus.State)
	}

	return PodStatus{
		Status:          string(getPodStatusPhase(pod, warnings)),
		PodPhase:        pod.Status.Phase,
		ContainerStates: states,
	}
}

// getPodStatusPhase returns one of four pod status phases (Pending, Running, Succeeded, Failed, Unknown, Terminating)
func getPodStatusPhase(pod v1.Pod, warnings []common.Event) v1.PodPhase {
	// For terminated pods that failed
	if pod.Status.Phase == v1.PodFailed {
		return v1.PodFailed
	}

	// For successfully terminated pods
	if pod.Status.Phase == v1.PodSucceeded {
		return v1.PodSucceeded
	}

	ready := false
	initialized := false
	for _, c := range pod.Status.Conditions {
		if c.Type == v1.PodReady {
			ready = c.Status == v1.ConditionTrue
		}
		if c.Type == v1.PodInitialized {
			initialized = c.Status == v1.ConditionTrue
		}
	}

	if initialized && ready && pod.Status.Phase == v1.PodRunning {
		return v1.PodRunning
	}

	// If the pod would otherwise be pending but has warning then label it as
	// failed and show and error to the user.
	if len(warnings) > 0 {
		return v1.PodFailed
	}

	if pod.DeletionTimestamp != nil && pod.Status.Reason == "NodeLost" {
		return v1.PodUnknown
	} else if pod.DeletionTimestamp != nil {
		return "Terminating"
	}

	// pending
	return v1.PodPending
}

// The code below allows to perform complex data section on []api.Pod

type PodCell v1.Pod

func (self PodCell) GetProperty(name dataselect.PropertyName) dataselect.ComparableValue {
	switch name {
	case dataselect.NameProperty:
		return dataselect.StdComparableString(self.ObjectMeta.Name)
	case dataselect.CreationTimestampProperty:
		return dataselect.StdComparableTime(self.ObjectMeta.CreationTimestamp.Time)
	case dataselect.NamespaceProperty:
		return dataselect.StdComparableString(self.ObjectMeta.Namespace)
	default:
		// if name is not supported then just return a constant dummy value, sort will have no effect.
		return nil
	}
}

func (self PodCell) GetResourceSelector() *metricapi.ResourceSelector {
	return &metricapi.ResourceSelector{
		Namespace:    self.ObjectMeta.Namespace,
		ResourceType: api.ResourceKindPod,
		ResourceName: self.ObjectMeta.Name,
		UID:          self.ObjectMeta.UID,
	}
}

func toCells(std []v1.Pod) []dataselect.DataCell {
	cells := make([]dataselect.DataCell, len(std))
	for i := range std {
		cells[i] = PodCell(std[i])
	}
	return cells
}

func fromCells(cells []dataselect.DataCell) []v1.Pod {
	std := make([]v1.Pod, len(cells))
	for i := range std {
		std[i] = v1.Pod(cells[i].(PodCell))
	}
	return std
}

func getPodConditions(pod v1.Pod) []common.Condition {
	var conditions []common.Condition
	for _, condition := range pod.Status.Conditions {
		conditions = append(conditions, common.Condition{
			Type:               string(condition.Type),
			Status:             condition.Status,
			LastProbeTime:      condition.LastProbeTime,
			LastTransitionTime: condition.LastTransitionTime,
			Reason:             condition.Reason,
			Message:            condition.Message,
		})
	}
	return conditions
}

func getStatus(list *v1.PodList, events []v1.Event) common.ResourceStatus {
	info := common.ResourceStatus{}
	if list == nil {
		return info
	}

	for _, pod := range list.Items {
		warnings := event.GetPodsEventWarnings(events, []v1.Pod{pod})
		switch getPodStatusPhase(pod, warnings) {
		case v1.PodFailed:
			info.Failed++
		case v1.PodSucceeded:
			info.Succeeded++
		case v1.PodRunning:
			info.Running++
		case v1.PodPending:
			info.Pending++
		case v1.PodUnknown:
			info.Unknown++
		case "Terminating":
			info.Terminating++
		}
	}

	return info
}
