// Copyright 2017 The Kubernetes Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
	Failed     ContainerState = "Failed"
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
		if state.Terminated.ExitCode > 0 {
			return Failed
		}

		return Terminated
	}

	if state.Running != nil {
		return Running
	}

	return Unknown
}
