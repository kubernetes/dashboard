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

	v1 "k8s.io/api/networking/v1"

	client "k8s.io/client-go/kubernetes"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/errors"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
)

// NetworkPolicy contains an information about single network policy in the list.
type NetworkPolicy struct {
	api.ObjectMeta `json:"objectMeta"`
	api.TypeMeta   `json:"typeMeta"`
}

// NetworkPolicyList contains a list of network policies.
type NetworkPolicyList struct {
	api.ListMeta `json:"listMeta"`
	Items        []NetworkPolicy `json:"items"`
	Errors       []error         `json:"errors"`
}

// GetNetworkPolicyList lists network policies from given namespace using given data select query.
func GetNetworkPolicyList(client client.Interface, namespace *common.NamespaceQuery,
	dsQuery *dataselect.DataSelectQuery) (*NetworkPolicyList, error) {
	saList, err := client.NetworkingV1().NetworkPolicies(namespace.ToRequestParam()).List(context.TODO(),
		api.ListEverything)

	nonCriticalErrors, criticalError := errors.HandleError(err)
	if criticalError != nil {
		return nil, criticalError
	}

	return toNetworkPolicyList(saList.Items, nonCriticalErrors, dsQuery), nil
}

func toNetworkPolicy(sa *v1.NetworkPolicy) NetworkPolicy {
	return NetworkPolicy{
		ObjectMeta: api.NewObjectMeta(sa.ObjectMeta),
		TypeMeta:   api.NewTypeMeta(api.ResourceKindNetworkPolicy),
	}
}

func toNetworkPolicyList(networkPolicys []v1.NetworkPolicy, nonCriticalErrors []error,
	dsQuery *dataselect.DataSelectQuery) *NetworkPolicyList {
	newNetworkPolicyList := &NetworkPolicyList{
		ListMeta: api.ListMeta{TotalItems: len(networkPolicys)},
		Items:    make([]NetworkPolicy, 0),
		Errors:   nonCriticalErrors,
	}

	saCells, filteredTotal := dataselect.GenericDataSelectWithFilter(toCells(networkPolicys), dsQuery)
	networkPolicys = fromCells(saCells)

	newNetworkPolicyList.ListMeta = api.ListMeta{TotalItems: filteredTotal}
	for _, sa := range networkPolicys {
		newNetworkPolicyList.Items = append(newNetworkPolicyList.Items, toNetworkPolicy(&sa))
	}

	return newNetworkPolicyList
}
