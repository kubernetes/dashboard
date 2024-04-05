package pod

import (
	v1 "k8s.io/api/core/v1"
)

type ContainerStatus struct {
	Name  string         `json:"name"`
	State ContainerState `json:"state"`
	Ready bool           `json:"ready"`
}

type ContainerState string

const (
	Waiting    ContainerState = "Waiting"
	Running    ContainerState = "Running"
	Terminated ContainerState = "Terminated"
	Unknown    ContainerState = "Unknown"
)

func ToContainerStatuses(containerStatuses []v1.ContainerStatus) []ContainerStatus {
	result := make([]ContainerStatus, len(containerStatuses))
	for i, c := range containerStatuses {
		result[i] = ContainerStatus{
			Name:  c.Name,
			State: toContainerState(c.State),
			Ready: c.Ready,
		}
	}

	return result
}

func toContainerState(state v1.ContainerState) ContainerState {
	if state.Waiting != nil {
		return Waiting
	}

	if state.Terminated != nil {
		return Terminated
	}

	if state.Running != nil {
		return Running
	}

	return Unknown
}
