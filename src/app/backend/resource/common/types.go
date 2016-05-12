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

package common

import (
	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/api/unversioned"
)

// ObjectMeta is metadata about an instance of a resource.
type ObjectMeta struct {
	// Name is unique within a namespace. Name is primarily intended for creation
	// idempotence and configuration definition.
	Name string `json:"name,omitempty"`

	// Namespace defines the space within which name must be unique. An empty namespace is
	// equivalent to the "default" namespace, but "default" is the canonical representation.
	// Not all objects are required to be scoped to a namespace - the value of this field for
	// those objects will be empty.
	Namespace string `json:"namespace,omitempty"`

	// Labels are key value pairs that may be used to scope and select individual resources.
	// Label keys are of the form:
	//     label-key ::= prefixed-name | name
	//     prefixed-name ::= prefix '/' name
	//     prefix ::= DNS_SUBDOMAIN
	//     name ::= DNS_LABEL
	// The prefix is optional.  If the prefix is not specified, the key is assumed to be private
	// to the user.  Other system components that wish to use labels must specify a prefix.
	Labels map[string]string `json:"labels,omitempty"`

	// Annotations are unstructured key value data stored with a resource that may be set by
	// external tooling. They are not queryable and should be preserved when modifying
	// objects.  Annotation keys have the same formatting restrictions as Label keys. See the
	// comments on Labels for details.
	Annotations map[string]string `json:"annotations,omitempty"`

	// CreationTimestamp is a timestamp representing the server time when this object was
	// created. It is not guaranteed to be set in happens-before order across separate operations.
	// Clients may not set this value. It is represented in RFC3339 form and is in UTC.
	CreationTimestamp unversioned.Time `json:"creationTimestamp,omitempty"`
}

// TypeMeta describes an individual object in an API response or request
// with strings representing the type of the object.
type TypeMeta struct {
	// Kind is a string value representing the REST resource this object represents.
	// Servers may infer this from the endpoint the client submits requests to.
	// In smalllettercase.
	// More info: http://releases.k8s.io/HEAD/docs/devel/api-conventions.md#types-kinds
	Kind ResourceKind `json:"kind,omitempty"`
}

// ServicePort is a pair of port and protocol, e.g. a service endpoint.
type ServicePort struct {
	// Positive port number.
	Port int `json:"port"`

	// Protocol name, e.g., TCP or UDP.
	Protocol api.Protocol `json:"protocol"`
}

// Events response structure.
type EventList struct {
	// Namespace.
	Namespace string `json:"namespace"`

	// List of events from given namespace.
	Events []Event `json:"events"`
}

// Event is a single event representation.
type Event struct {
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

	// The number of times this event has occurred.
	Count int `json:"count"`

	// The time at which the event was first recorded.
	FirstSeen unversioned.Time `json:"firstSeen"`

	// The time at which the most recent occurrence of this event was recorded.
	LastSeen unversioned.Time `json:"lastSeen"`

	// Short, machine understandable string that gives the reason
	// for this event being generated.
	Reason string `json:"reason"`

	// Event type (at the moment only normal and warning are supported).
	Type string `json:"type"`
}

// Returns internal endpoint name for the given service properties, e.g.,
// NewObjectMeta creates a new instance of ObjectMeta struct based on K8s object meta.
func NewObjectMeta(k8SObjectMeta api.ObjectMeta) ObjectMeta {
	return ObjectMeta{
		Name:              k8SObjectMeta.Name,
		Namespace:         k8SObjectMeta.Namespace,
		Labels:            k8SObjectMeta.Labels,
		CreationTimestamp: k8SObjectMeta.CreationTimestamp,
	}
}

// NewTypeMeta creates new type mete for the resource kind.
func NewTypeMeta(kind ResourceKind) TypeMeta {
	return TypeMeta{
		Kind: kind,
	}
}

// ResourceKind is an unique name for each resource. It can used for API discovery and generic
// code that does things based on the kind. For example, there may be a generic "deleter"
// that based on resource kind, name and namespace deletes it.
type ResourceKind string

// List of all resource kinds supported by the UI.
const (
	ResourceKindReplicaSet            = "replicaset"
	ResourceKindService               = "service"
	ResourceKindDeployment            = "deployment"
	ResourceKindPod                   = "pod"
	ResourceKindReplicationController = "replicationcontroller"
)

// Mapping from resource kind to K8s apiserver API path. This is mostly pluralization, because
// K8s apiserver uses plural paths and this project singular.
// Must be kept in sync with the list of supported kinds.
var kindToAPIPathMapping = map[string]string{
	ResourceKindService:               "services",
	ResourceKindPod:                   "pods",
	ResourceKindReplicationController: "replicationcontrollers",
	ResourceKindDeployment:            "deployments",
	ResourceKindReplicaSet:            "replicasets",
}

// GetServicePorts returns human readable name for the given service ports list.
func GetServicePorts(apiPorts []api.ServicePort) []ServicePort {
	var ports []ServicePort
	for _, port := range apiPorts {
		ports = append(ports, ServicePort{port.Port, port.Protocol})
	}
	return ports
}

// IsLabelSelectorMatching returns true when an object with the given
// selector targets the same Resources (or subset) that
// the tested object with the given selector.
func IsLabelSelectorMatching(labelSelector map[string]string,
	testedObjectLabels map[string]string) bool {

	// If there are no label selectors, then assume it targets different Resource.
	if len(labelSelector) == 0 {
		return false
	}

	for label, value := range labelSelector {
		if rsValue, ok := testedObjectLabels[label]; !ok || rsValue != value {
			return false
		}
	}

	return true
}

func FilterNamespacedPodsBySelector(pods []api.Pod, namespace string,
	resourceSelector map[string]string) []api.Pod {

	var matchingPods []api.Pod
	for _, pod := range pods {
		if pod.ObjectMeta.Namespace == namespace &&
			IsLabelSelectorMatching(resourceSelector, pod.Labels) {
			matchingPods = append(matchingPods, pod)
		}
	}

	return matchingPods
}

// Returns pods targeted by given selector.
func FilterPodsBySelector(pods []api.Pod, resourceSelector map[string]string) []api.Pod {

	var matchingPods []api.Pod
	for _, pod := range pods {
		if IsLabelSelectorMatching(resourceSelector, pod.Labels) {
			matchingPods = append(matchingPods, pod)
		}
	}
	return matchingPods
}
