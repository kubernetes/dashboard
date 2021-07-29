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
	"github.com/kubernetes/dashboard/src/app/backend/api"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// EventList is an events response structure.
type EventList struct {
	ListMeta api.ListMeta `json:"listMeta"`

	// List of events from given namespace.
	Events []Event `json:"events"`

	// List of non-critical errors, that occurred during resource retrieval.
	Errors []error `json:"errors"`
}

// Event is a single event representation.
type Event struct {
	ObjectMeta api.ObjectMeta `json:"objectMeta"`
	TypeMeta   api.TypeMeta   `json:"typeMeta"`

	// A human-readable description of the status of related object.
	Message string `json:"message"`

	// Component from which the event is generated.
	SourceComponent string `json:"sourceComponent"`

	// Host name on which the event is generated.
	SourceHost string `json:"sourceHost"`

	// Reference to a piece of an object, which triggered an event. For example
	// "spec.containers{name}" refers to container within pod with given name, if no container
	// name is specified, for example "spec.containers[2]", then it refers to container with
	// index 2 in this pod.
	SubObject string `json:"object"`

	// Kind of the referent.
	// +optional
	SubObjectKind string `json:"objectKind,omitempty"`

	// Name of the referent.
	// +optional
	SubObjectName string `json:"objectName,omitempty"`

	// Namespace of the referent.
	// +optional
	SubObjectNamespace string `json:"objectNamespace,omitempty"`

	// The number of times this event has occurred.
	Count int32 `json:"count"`

	// The time at which the event was first recorded.
	FirstSeen v1.Time `json:"firstSeen"`

	// The time at which the most recent occurrence of this event was recorded.
	LastSeen v1.Time `json:"lastSeen"`

	// Short, machine understandable string that gives the reason
	// for this event being generated.
	Reason string `json:"reason"`

	// Event type (at the moment only normal and warning are supported).
	Type string `json:"type"`
}
