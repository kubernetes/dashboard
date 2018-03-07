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
	"encoding/json"
	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	networkpolicy "k8s.io/api/networking/v1"
)

func toNetworkPolicy(networkpolicy *networkpolicy.NetworkPolicy) NetworkPolicy {
	//deepcopy
	byte, err := json.Marshal(networkpolicy.Spec)
	var result NetworkPolicy
	if err != nil {
		return result
	}
	var unMarshalPolicy NetworkPolicySpec
	err = json.Unmarshal(byte, &unMarshalPolicy)
	if err != nil {
		return result
	}
	result = NetworkPolicy{
		ObjectMeta: api.NewObjectMeta(networkpolicy.ObjectMeta),
		TypeMeta:   api.NewTypeMeta(api.ResourceKindNetworkPolicy),
		Spec:       unMarshalPolicy,
	}
	return result
}

type NetworkPolicyCell networkpolicy.NetworkPolicy

func (self NetworkPolicyCell) GetProperty(name dataselect.PropertyName) dataselect.ComparableValue {
	switch name {
	case dataselect.NameProperty:
		return dataselect.StdComparableString(self.ObjectMeta.Name)
	case dataselect.CreationTimestampProperty:
		return dataselect.StdComparableTime(self.ObjectMeta.CreationTimestamp.Time)
	case dataselect.NamespaceProperty:
		return dataselect.StdComparableString(self.ObjectMeta.Namespace)
	default:
		// if name is not supported then just return a constant dummy value, sort will have no effect.
		return nil
	}
}

func toCells(std []networkpolicy.NetworkPolicy) []dataselect.DataCell {
	cells := make([]dataselect.DataCell, len(std))
	for i := range std {
		cells[i] = NetworkPolicyCell(std[i])
	}
	return cells
}

func fromCells(cells []dataselect.DataCell) []networkpolicy.NetworkPolicy {
	std := make([]networkpolicy.NetworkPolicy, len(cells))
	for i := range std {
		std[i] = networkpolicy.NetworkPolicy(cells[i].(NetworkPolicyCell))
	}
	return std
}
