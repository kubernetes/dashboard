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

package api

import (
	"k8s.io/apimachinery/pkg/apis/meta/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/fields"
	"k8s.io/apimachinery/pkg/labels"
)

// CsrfToken is used to secure requests from CSRF attacks
type CsrfToken struct {
	// Token generated on request for validation
	Token string `json:"token"`
}

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
	CreationTimestamp v1.Time `json:"creationTimestamp,omitempty"`
}

// TypeMeta describes an individual object in an API response or request with strings representing
// the type of the object.
type TypeMeta struct {
	// Kind is a string value representing the REST resource this object represents.
	// Servers may infer this from the endpoint the client submits requests to.
	// In smalllettercase.
	// More info: http://releases.k8s.io/HEAD/docs/devel/api-conventions.md#types-kinds
	Kind ResourceKind `json:"kind,omitempty"`
}

// ListMeta describes list of objects, i.e. holds information about pagination options set for the list.
type ListMeta struct {
	// Total number of items on the list. Used for pagination.
	TotalItems int `json:"totalItems"`
}

// NewObjectMeta returns internal endpoint name for the given service properties, e.g.,
// NewObjectMeta creates a new instance of ObjectMeta struct based on K8s object meta.
func NewObjectMeta(k8SObjectMeta metaV1.ObjectMeta) ObjectMeta {
	return ObjectMeta{
		Name:              k8SObjectMeta.Name,
		Namespace:         k8SObjectMeta.Namespace,
		Labels:            k8SObjectMeta.Labels,
		CreationTimestamp: k8SObjectMeta.CreationTimestamp,
		Annotations:       k8SObjectMeta.Annotations,
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
	ResourceKindConfigMap               = "configmap"
	ResourceKindDaemonSet               = "daemonset"
	ResourceKindDeployment              = "deployment"
	ResourceKindEvent                   = "event"
	ResourceKindHorizontalPodAutoscaler = "horizontalpodautoscaler"
	ResourceKindIngress                 = "ingress"
	ResourceKindJob                     = "job"
	ResourceKindCronJob                 = "cronjob"
	ResourceKindLimitRange              = "limitrange"
	ResourceKindNamespace               = "namespace"
	ResourceKindNode                    = "node"
	ResourceKindPersistentVolumeClaim   = "persistentvolumeclaim"
	ResourceKindPersistentVolume        = "persistentvolume"
	ResourceKindPod                     = "pod"
	ResourceKindReplicaSet              = "replicaset"
	ResourceKindReplicationController   = "replicationcontroller"
	ResourceKindResourceQuota           = "resourcequota"
	ResourceKindSecret                  = "secret"
	ResourceKindService                 = "service"
	ResourceKindStatefulSet             = "statefulset"
	ResourceKindStorageClass            = "storageclass"
	ResourceKindRbacRole                = "role"
	ResourceKindRbacClusterRole         = "clusterrole"
	ResourceKindRbacRoleBinding         = "rolebinding"
	ResourceKindRbacClusterRoleBinding  = "clusterrolebinding"
	ResourceKindEndpoint                = "endpoint"
)

// ClientType represents type of client that is used to perform generic operations on resources.
// Different resources belong to different client, i.e. Deployments belongs to extension client
// and StatefulSets to apps client.
type ClientType string

// List of client types supported by the UI.
const (
	ClientTypeDefault           = "restclient"
	ClientTypeExtensionClient   = "extensionclient"
	ClientTypeAppsClient        = "appsclient"
	ClientTypeBatchClient       = "batchclient"
	ClientTypeBetaBatchClient   = "betabatchclient"
	ClientTypeAutoscalingClient = "autoscalingclient"
	ClientTypeStorageClient     = "storageclient"
)

// Mapping from resource kind to K8s apiserver API path. This is mostly pluralization, because
// K8s apiserver uses plural paths and this project singular.
// Must be kept in sync with the list of supported kinds.
var KindToAPIMapping = map[string]struct {
	// Kubernetes resource name.
	Resource string
	// Client type used by given resource, i.e. deployments are using extension client.
	ClientType ClientType
	// Is this object global scoped (not below a namespace).
	Namespaced bool
}{
	ResourceKindConfigMap:               {"configmaps", ClientTypeDefault, true},
	ResourceKindDaemonSet:               {"daemonsets", ClientTypeExtensionClient, true},
	ResourceKindDeployment:              {"deployments", ClientTypeExtensionClient, true},
	ResourceKindEvent:                   {"events", ClientTypeDefault, true},
	ResourceKindHorizontalPodAutoscaler: {"horizontalpodautoscalers", ClientTypeAutoscalingClient, true},
	ResourceKindIngress:                 {"ingresses", ClientTypeExtensionClient, true},
	ResourceKindJob:                     {"jobs", ClientTypeBatchClient, true},
	ResourceKindCronJob:                 {"cronjobs", ClientTypeBetaBatchClient, true},
	ResourceKindLimitRange:              {"limitrange", ClientTypeDefault, true},
	ResourceKindNamespace:               {"namespaces", ClientTypeDefault, false},
	ResourceKindNode:                    {"nodes", ClientTypeDefault, false},
	ResourceKindPersistentVolumeClaim:   {"persistentvolumeclaims", ClientTypeDefault, true},
	ResourceKindPersistentVolume:        {"persistentvolumes", ClientTypeDefault, false},
	ResourceKindPod:                     {"pods", ClientTypeDefault, true},
	ResourceKindReplicaSet:              {"replicasets", ClientTypeExtensionClient, true},
	ResourceKindReplicationController:   {"replicationcontrollers", ClientTypeDefault, true},
	ResourceKindResourceQuota:           {"resourcequotas", ClientTypeDefault, true},
	ResourceKindSecret:                  {"secrets", ClientTypeDefault, true},
	ResourceKindService:                 {"services", ClientTypeDefault, true},
	ResourceKindStatefulSet:             {"statefulsets", ClientTypeAppsClient, true},
	ResourceKindStorageClass:            {"storageclasses", ClientTypeStorageClient, false},
	ResourceKindEndpoint:                {"endpoints", ClientTypeDefault, true},
}

// IsSelectorMatching returns true when an object with the given selector targets the same
// Resources (or subset) that the tested object with the given selector.
func IsSelectorMatching(labelSelector map[string]string, testedObjectLabels map[string]string) bool {
	// If service has no selectors, then assume it targets different resource.
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

// IsLabelSelectorMatching returns true when a resource with the given selector targets the same
// Resources(or subset) that a tested object selector with the given selector.
func IsLabelSelectorMatching(selector map[string]string, labelSelector *v1.LabelSelector) bool {
	// If the resource has no selectors, then assume it targets different Pods.
	if len(selector) == 0 {
		return false
	}
	for label, value := range selector {
		if rsValue, ok := labelSelector.MatchLabels[label]; !ok || rsValue != value {
			return false
		}
	}
	return true
}

// ListEverything is a list options used to list all resources without any filtering.
var ListEverything = metaV1.ListOptions{
	LabelSelector: labels.Everything().String(),
	FieldSelector: fields.Everything().String(),
}
