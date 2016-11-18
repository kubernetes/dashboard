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

	"github.com/kubernetes/dashboard/src/app/backend/client"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/metric"
	"github.com/kubernetes/dashboard/src/app/backend/resource/pod"

	"k8s.io/kubernetes/pkg/api"
	k8sClient "k8s.io/kubernetes/pkg/client/clientset_generated/internalclientset"
	"k8s.io/kubernetes/pkg/client/clientset_generated/internalclientset/fake"
	"k8s.io/kubernetes/pkg/client/restclient"
)

type FakeHeapsterClient struct {
	client k8sClient.Interface
}

func (c FakeHeapsterClient) Get(path string) client.RequestInterface {
	return &restclient.Request{}
}

func TestGetNodeDetail(t *testing.T) {
	cases := []struct {
		namespace, name string
		node            *api.Node
		expected        *NodeDetail
	}{
		{
			"test-namespace", "test-node",
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
				PodList: pod.PodList{
					Pods:              []pod.Pod{},
					CumulativeMetrics: make([]metric.Metric, 0),
				},
				EventList: common.EventList{
					Events: nil,
				},
				AllocatedResources: NodeAllocatedResources{
					CPURequests:            0,
					CPURequestsFraction:    0,
					CPULimits:              0,
					CPULimitsFraction:      0,
					CPUCapacity:            0,
					MemoryRequests:         0,
					MemoryRequestsFraction: 0,
					MemoryLimits:           0,
					MemoryLimitsFraction:   0,
					MemoryCapacity:         0,
					AllocatedPods:          0,
					PodCapacity:            0,
				},
				Metrics: make([]metric.Metric, 0),
			},
		},
	}

	for _, c := range cases {
		fakeClient := fake.NewSimpleClientset(c.node)
		fakeHeapsterClient := FakeHeapsterClient{client: fake.NewSimpleClientset()}

		dataselect.StdMetricsDataSelect.MetricQuery = dataselect.NoMetrics
		actual, _ := GetNodeDetail(fakeClient, fakeHeapsterClient, c.name)

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetNodeDetail(client,heapsterClient,%#v, %#v) == \ngot: %#v, \nexpected %#v",
				c.namespace, c.name, actual, c.expected)
		}
	}
}
