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
	"context"
	"log"

	v1 "k8s.io/api/networking/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	client "k8s.io/client-go/kubernetes"
)

// NetworkPolicyDetail contains detailed information about a network policy.
type NetworkPolicyDetail struct {
	NetworkPolicy `json:",inline"`
	PodSelector   metaV1.LabelSelector          `json:"podSelector"`
	Ingress       []v1.NetworkPolicyIngressRule `json:"ingress,omitempty"`
	Egress        []v1.NetworkPolicyEgressRule  `json:"egress,omitempty"`
	PolicyTypes   []v1.PolicyType               `json:"policyTypes,omitempty"`
	Errors        []error                       `json:"errors"`
}

// GetNetworkPolicyDetail returns detailed information about a network policy.
func GetNetworkPolicyDetail(client client.Interface, namespace, name string) (*NetworkPolicyDetail, error) {
	log.Printf("Getting details of %s network policy in %s namespace", name, namespace)

	raw, err := client.NetworkingV1().NetworkPolicies(namespace).Get(context.TODO(), name, metaV1.GetOptions{})
	if err != nil {
		return nil, err
	}

	return getNetworkPolicyDetail(raw), nil
}

func getNetworkPolicyDetail(np *v1.NetworkPolicy) *NetworkPolicyDetail {
	return &NetworkPolicyDetail{
		NetworkPolicy: toNetworkPolicy(np),
		PodSelector:   np.Spec.PodSelector,
		Ingress:       np.Spec.Ingress,
		Egress:        np.Spec.Egress,
		PolicyTypes:   np.Spec.PolicyTypes,
	}
}
