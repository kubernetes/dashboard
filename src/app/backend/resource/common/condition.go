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

package common

import (
	api "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1"
)

// Condition represents a single condition of a pod or node.
type Condition struct {
	// Type of a condition.
	Type string `json:"type"`
	// Status of a condition.
	Status api.ConditionStatus `json:"status"`
	// Last probe time of a condition.
	LastProbeTime v1.Time `json:"lastProbeTime"`
	// Last transition time of a condition.
	LastTransitionTime v1.Time `json:"lastTransitionTime"`
	// Reason of a condition.
	Reason string `json:"reason"`
	// Message of a condition.
	Message string `json:"message"`
}
