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

package node

import (
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/client"
	"github.com/kubernetes/dashboard/resource/common"
	"k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/client/restclient"
	k8sClient "k8s.io/kubernetes/pkg/client/unversioned"
	"k8s.io/kubernetes/pkg/client/unversioned/testclient"
)

type FakeHeapsterClient struct {
	client k8sClient.Interface
}

func (c FakeHeapsterClient) Get(path string) client.RequestInterface {
	return &restclient.Request{}
}

func TestGetNodeDetail(t *testing.T) {
	eventList := &api.EventList{}
	podList := &api.PodList{}

	cases := []struct {
		namespace, name string
		expectedActions []string
		node            *api.Node
		expected        *NodeDetail
	}{
		{
			"test-namespace", "test-name",
			[]string{"get"},
			&api.Node{
				ObjectMeta: api.ObjectMeta{Name: "test-node"},
				Spec: api.NodeSpec{
					ExternalID:    "127.0.0.1",
					PodCIDR:       "127.0.0.1",
					ProviderID:    "ID-1",
					Unschedulable: true,
				},
			},
			&NodeDetail{
				ObjectMeta:    common.ObjectMeta{Name: "test-node"},
				TypeMeta:      common.TypeMeta{Kind: common.ResourceKindNode},
				ExternalID:    "127.0.0.1",
				PodCIDR:       "127.0.0.1",
				ProviderID:    "ID-1",
				Unschedulable: true,
			},
		},
	}

	for _, c := range cases {
		fakeClient := testclient.NewSimpleFake(c.node, podList, eventList, c.node,
			podList, eventList)
		fakeHeapsterClient := FakeHeapsterClient{client: testclient.NewSimpleFake()}

		actual, _ := GetNodeDetail(fakeClient, fakeHeapsterClient, c.name)

		actions := fakeClient.Actions()
		if len(actions) != len(c.expectedActions) {
			t.Errorf("Unexpected actions: %v, expected %d actions got %d", actions,
				len(c.expectedActions), len(actions))
			continue
		}

		for i, verb := range c.expectedActions {
			if actions[i].GetVerb() != verb {
				t.Errorf("Unexpected action: %+v, expected %s", actions[i], verb)
			}
		}

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetEvents(client,heapsterClient,%#v, %#v) == \ngot: %#v, \nexpected %#v",
				c.namespace, c.name, actual, c.expected)
		}
	}
}
