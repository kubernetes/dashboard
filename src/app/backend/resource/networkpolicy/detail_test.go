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
  "github.com/kubernetes/dashboard/src/app/backend/resource/common"
  networkpolicy "k8s.io/api/networking/v1"
  metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
  "k8s.io/client-go/kubernetes/fake"
)

func TestGetNetworkPolicy(t *testing.T) {
  cases := []struct {
    networkPolicy *networkpolicy.NetworkPolicy
    expected      *NetworkPolicy
  }{
    {
      networkPolicy: &networkpolicy.NetworkPolicy{
        ObjectMeta: metaV1.ObjectMeta{
          Name:      "networkpolicy",
          Namespace: "kube",
          Labels:    map[string]string{},
        },
        Spec: networkpolicy.NetworkPolicySpec{
          PodSelector: metaV1.LabelSelector{
            MatchLabels: map[string]string{"matchKey": "value",},
          },
        },
      },
      expected: &NetworkPolicy{
        ObjectMeta: api.ObjectMeta{
          Name:      "networkpolicy",
          Namespace: "kube",
          Labels:    map[string]string{},
        },
        Spec: NetworkPolicySpec{
          PodSelector: metaV1.LabelSelector{
            MatchLabels: map[string]string{"matchKey": "value",},
          },
        },
        TypeMeta: api.TypeMeta{Kind: api.ResourceKindNetworkPolicy},
      },
    },
  }

  for _, c := range cases {
    fakeClient := fake.NewSimpleClientset(c.networkPolicy)
    actual, _ := GetNetworkPolicy(fakeClient, common.NewNamespaceQuery(nil), "networkpolicy")

    if !reflect.DeepEqual(actual, c.expected) {
      t.Errorf("GetNetworkPolicy(%#v) == \ngot %#v, \nexpected %#v", c.networkPolicy, actual, c.expected)
    }
  }
}
