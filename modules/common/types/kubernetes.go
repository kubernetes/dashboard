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

package types

import (
	"github.com/samber/lo"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/types"
)

const (
	// NodeUnreachablePodReason is the reason on a pod when its state cannot be confirmed as kubelet is unresponsive
	// on the node it is (was) running.
	NodeUnreachablePodReason = "NodeLost"
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
	CreationTimestamp metav1.Time `json:"creationTimestamp,omitempty"`

	// UID is a type that holds unique ID values, including UUIDs.  Because we
	// don't ONLY use UUIDs, this is an alias to string.  Being a type captures
	// intent and helps make sure that UIDs and names do not get conflated.
	UID types.UID `json:"uid,omitempty"`

	// OwnerReference contains enough information to let you identify an owning
	// object. See [OwnerReference] for more information.
	OwnerReferences []OwnerReference `json:"ownerReferences,omitempty"`
}

// OwnerReference contains enough information to let you identify an owning
// object. An owning object must be in the same namespace as the dependent, or
// be cluster-scoped, so there is no namespace field.
type OwnerReference struct {
	// Kind of the referent.
	Kind string `json:"kind"`

	// Name of the referent.
	Name string `json:"name"`
}

// TypeMeta describes an individual object in an API response or request with strings representing
// the type of the object.
type TypeMeta struct {
	// Kind is a string value representing the REST resource this object represents.
	// Servers may infer this from the endpoint the client submits requests to.
	// In smalllettercase.
	// More info: http://releases.k8s.io/HEAD/docs/devel/api-conventions.md#types-kinds
	Kind ResourceKind `json:"kind,omitempty"`

	// Scalable represents whether or not an object is scalable.
	Scalable bool `json:"scalable,omitempty"`

	// Restartable represents whether or not an object is restartable.
	Restartable bool `json:"restartable,omitempty"`
}

// ListMeta describes list of objects, i.e. holds information about pagination options set for the list.
type ListMeta struct {
	// Total number of items on the list. Used for pagination.
	TotalItems int `json:"totalItems"`
}

func toOwnerReferences(ownerReferences []metav1.OwnerReference) []OwnerReference {
	if len(ownerReferences) == 0 {
		return nil
	}

	return lo.Map(ownerReferences, func(ref metav1.OwnerReference, _ int) OwnerReference {
		return OwnerReference{
			Kind: ref.Kind,
			Name: ref.Name,
		}
	})
}

// NewObjectMeta returns internal endpoint name for the given service properties, e.g.,
// NewObjectMeta creates a new instance of ObjectMeta struct based on K8s object meta.
func NewObjectMeta(k8SObjectMeta metav1.ObjectMeta) ObjectMeta {
	return ObjectMeta{
		Name:              k8SObjectMeta.Name,
		Namespace:         k8SObjectMeta.Namespace,
		Labels:            k8SObjectMeta.Labels,
		CreationTimestamp: k8SObjectMeta.CreationTimestamp,
		Annotations:       k8SObjectMeta.Annotations,
		UID:               k8SObjectMeta.UID,
		OwnerReferences:   toOwnerReferences(k8SObjectMeta.OwnerReferences),
	}
}

// NewTypeMeta creates new type mete for the resource kind.
func NewTypeMeta(kind ResourceKind) TypeMeta {
	return TypeMeta{
		Kind:        kind,
		Scalable:    kind.Scalable(),
		Restartable: kind.Restartable(),
	}
}
