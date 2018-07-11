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
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	networkpolicy "k8s.io/api/networking/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func TestToNetworkPolicy(t *testing.T) {
	cases := []struct {
		networkPolicy *networkpolicy.NetworkPolicy
		expected      NetworkPolicy
	}{
		{
			networkPolicy: &networkpolicy.NetworkPolicy{},
			expected: NetworkPolicy{
				TypeMeta: api.TypeMeta{Kind: api.ResourceKindNetworkPolicy},
			},
		}, {
			networkPolicy: &networkpolicy.NetworkPolicy{
				ObjectMeta: metaV1.ObjectMeta{Name: "networkPolicy"}},
			expected: NetworkPolicy{
				ObjectMeta: api.ObjectMeta{Name: "networkPolicy"},
				TypeMeta:   api.TypeMeta{Kind: api.ResourceKindNetworkPolicy},
			},
		}, {
			networkPolicy: &networkpolicy.NetworkPolicy{
				ObjectMeta: metaV1.ObjectMeta{
					Name:      "networkpolicy",
					Namespace: "kube",
					Labels:    map[string]string{"app": "prometheus"},
				},
				Spec: networkpolicy.NetworkPolicySpec{
					PodSelector: metaV1.LabelSelector{
						MatchLabels: map[string]string{"matchKey": "value"},
					},
					PolicyTypes: []networkpolicy.PolicyType{networkpolicy.PolicyTypeEgress, networkpolicy.PolicyTypeIngress},
				},
			},
			expected: NetworkPolicy{
				ObjectMeta: api.ObjectMeta{
					Name:      "networkpolicy",
					Namespace: "kube",
					Labels:    map[string]string{"app": "prometheus"},
				},
				Spec: NetworkPolicySpec{
					PodSelector: metaV1.LabelSelector{
						MatchLabels: map[string]string{"matchKey": "value"},
					},
					PolicyTypes: []PolicyType{PolicyTypeEgress, PolicyTypeIngress},
				},
				TypeMeta: api.TypeMeta{Kind: api.ResourceKindNetworkPolicy},
			},
		},
	}

	for _, c := range cases {
		actual := toNetworkPolicy(c.networkPolicy)

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("toNetworkPolicy(%#v) == \ngot %#v, \nexpected %#v", c.networkPolicy, actual, c.expected)
		}
	}

}

func TestGetProperty(t *testing.T) {
	cases := []struct {
		networkPolicyCell *NetworkPolicyCell
		expected          NetworkPolicyCell
	}{
		{
			networkPolicyCell: &NetworkPolicyCell{
				ObjectMeta: metaV1.ObjectMeta{
					Name:      "networkpolicy",
					Namespace: "kube",
				},
			},
			expected: NetworkPolicyCell{
				ObjectMeta: metaV1.ObjectMeta{
					Name:      "networkpolicy",
					Namespace: "kube",
				},
			},
		},
	}

	for _, c := range cases {
		actual := c.networkPolicyCell.GetProperty(dataselect.NameProperty)
		if actual != dataselect.StdComparableString(c.expected.Name) {
			t.Error("GetProperty name property error")
		}

		actual = c.networkPolicyCell.GetProperty(dataselect.NamespaceProperty)
		if actual != dataselect.StdComparableString(c.expected.Namespace) {
			t.Error("GetProperty namespace property error")
		}

		actual = c.networkPolicyCell.GetProperty(dataselect.StatusProperty)
		if actual != nil {
			t.Error("GetProperty error")
		}
	}

}
