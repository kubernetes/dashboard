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

package networkpolicy

import (
	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

// NetworkPolicy describes what network traffic is allowed for a set of Pods
type NetworkPolicy struct {
	TypeMeta api.TypeMeta `json:"typeMeta"`
	// object's metadata.
	ObjectMeta api.ObjectMeta `json:"objectMeta"`
	// Specification of the desired behavior for this NetworkPolicy.
	Spec NetworkPolicySpec `json:"spec,omitempty" protobuf:"bytes,2,opt,name=spec"`
}

// Policy Type string describes the NetworkPolicy type
type PolicyType string

const (
	// PolicyTypeIngress is a NetworkPolicy that affects ingress traffic on selected pods
	PolicyTypeIngress PolicyType = "Ingress"
	// PolicyTypeEgress is a NetworkPolicy that affects egress traffic on selected pods
	PolicyTypeEgress PolicyType = "Egress"
)

// NetworkPolicySpec provides the specification of a NetworkPolicy
type NetworkPolicySpec struct {
	// Selects the pods to which this NetworkPolicy object applies.
	PodSelector metav1.LabelSelector `json:"podSelector" protobuf:"bytes,1,opt,name=podSelector"`

	// List of rule types that the NetworkPolicy relates to.
	// Valid options are Ingress, Egress, or Ingress,Egress.
	PolicyTypes []PolicyType `json:"policyTypes,omitempty" protobuf:"bytes,4,rep,name=policyTypes,casttype=PolicyType"`
}

// GetNetworkPolicy returns network policy object.
func GetNetworkPolicy(client kubernetes.Interface, nsQuery *common.NamespaceQuery, name string) (*NetworkPolicy, error) {
	result, err := client.NetworkingV1().NetworkPolicies(nsQuery.ToRequestParam()).Get(name, metav1.GetOptions{})
	if err != nil {
		return nil, err
	}
	networkPolicy := toNetworkPolicy(result)
	return &networkPolicy, err
}
