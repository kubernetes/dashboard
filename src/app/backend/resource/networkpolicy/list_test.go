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
  "github.com/kubernetes/dashboard/src/app/backend/resource/common"
  networking "k8s.io/api/networking/v1"
  metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
  "k8s.io/client-go/kubernetes/fake"
)

func TestGetNetworkPolicyList(t *testing.T){
  cases :=[]struct {
    networkPolicyList *networking.NetworkPolicyList
    expectedActions  []string
    expected          *NetworkPolicyList
  }{
      {
        networkPolicyList:&networking.NetworkPolicyList{
          Items:  []networking.NetworkPolicy{
            {
              ObjectMeta: metaV1.ObjectMeta{
              Name:   "networkpolicy",
              Namespace: "default",
              Labels: map[string]string{},
            },
              Spec: networking.NetworkPolicySpec{
                PodSelector:  metaV1.LabelSelector{
                  MatchLabels: map[string]string{},
                },
                Ingress: []networking.NetworkPolicyIngressRule{
                  {
                    Ports: []networking.NetworkPolicyPort{
                      {},
                    },
                  },
                },
              },
            },
          },
        },
        expectedActions: []string{"list"},
        expected: &NetworkPolicyList{
          ListMeta: api.ListMeta{TotalItems: 1},
          NetworkPolicy: []NetworkPolicy{
            {
              ObjectMeta: api.ObjectMeta{
                Name:   "networkpolicy",
                Namespace: "default",
                Labels: map[string]string{},
              },
              Spec: NetworkPolicySpec{
                PodSelector: metaV1.LabelSelector{
                  MatchLabels: map[string]string{},
                },
                Ingress: []NetworkPolicyIngressRule{
                  {
                    Ports: []NetworkPolicyPort{
                      {},
                    },
                  },
                },
              },
              TypeMeta: api.TypeMeta{Kind: api.ResourceKindNetworkPolicy},
            },
          },
          Errors: []error{},
      },
    },
  }

  for _,c := range cases {
    fakeClient := fake.NewSimpleClientset(c.networkPolicyList)
    actual, _ :=GetNetworkPolicyList(fakeClient, common.NewNamespaceQuery(nil), dataselect.NoDataSelect)
    actions := fakeClient.Actions()
    if len(actions) != len(c.expectedActions) {
      t.Errorf("Unexpected actions: %v, expected %d actions got %d", actions,
      len(c.expectedActions), len(actions))
      continue
    }

    if !reflect.DeepEqual(actual, c.expected) {
      t.Errorf("GetNetworkPolicyList(client) == got\n%#v, expected\n %#v", actual, c.expected)
    }
  }
}


