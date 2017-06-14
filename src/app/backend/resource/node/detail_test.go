// Copyright 2017 The Kubernetes Dashboard Authors.
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

	"github.com/kubernetes/dashboard/src/app/backend/api"
	"github.com/kubernetes/dashboard/src/app/backend/integration/metric/heapster"
	"github.com/kubernetes/dashboard/src/app/backend/resource/common"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	"github.com/kubernetes/dashboard/src/app/backend/resource/metric"
	"github.com/kubernetes/dashboard/src/app/backend/resource/pod"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes/fake"
	"k8s.io/client-go/pkg/api/v1"
	restclient "k8s.io/client-go/rest"
)

type FakeHeapsterClient struct {
	client fake.Clientset
}

func (c FakeHeapsterClient) Get(path string) heapster.RequestInterface {
	return &restclient.Request{}
}

func TestGetNodeDetail(t *testing.T) {
	cases := []struct {
		namespace, name string
		node            *v1.Node
		expected        *NodeDetail
	}{
		{
			"test-namespace", "test-node",
			&v1.Node{
				ObjectMeta: metaV1.ObjectMeta{Name: "test-node"},
				Spec: v1.NodeSpec{
					ExternalID:    "127.0.0.1",
					PodCIDR:       "127.0.0.1",
					ProviderID:    "ID-1",
					Unschedulable: true,
				},
			},
			&NodeDetail{
				ObjectMeta:    api.ObjectMeta{Name: "test-node"},
				TypeMeta:      api.TypeMeta{Kind: api.ResourceKindNode},
				ExternalID:    "127.0.0.1",
				PodCIDR:       "127.0.0.1",
				ProviderID:    "ID-1",
				Unschedulable: true,
				PodList: pod.PodList{
					Pods:              []pod.Pod{},
					CumulativeMetrics: make([]metric.Metric, 0),
				},
				EventList: common.EventList{
					Events: make([]common.Event, 0),
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
					PodFraction:            0,
				},
				Metrics: make([]metric.Metric, 0),
			},
		},
	}

	for _, c := range cases {
		fakeClient := fake.NewSimpleClientset(c.node)
		fakeHeapsterClient := FakeHeapsterClient{client: *fake.NewSimpleClientset()}

		dataselect.StdMetricsDataSelect.MetricQuery = dataselect.NoMetrics
		actual, _ := GetNodeDetail(fakeClient, fakeHeapsterClient, c.name)

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetNodeDetail(client,heapsterClient,%#v, %#v) == \ngot: %#v, \nexpected %#v",
				c.namespace, c.name, actual, c.expected)
		}
	}
}
