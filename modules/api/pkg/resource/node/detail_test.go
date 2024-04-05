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

package node

import (
	"reflect"
	"testing"

	v1 "k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes/fake"

	metricapi "k8s.io/dashboard/api/pkg/integration/metric/api"
	"k8s.io/dashboard/api/pkg/resource/common"
	"k8s.io/dashboard/api/pkg/resource/dataselect"
	"k8s.io/dashboard/api/pkg/resource/pod"
	"k8s.io/dashboard/types"
)

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
					PodCIDR:       "127.0.0.1",
					ProviderID:    "ID-1",
					Unschedulable: true,
				},
			},
			&NodeDetail{
				Node: Node{
					ObjectMeta: types.ObjectMeta{Name: "test-node"},
					TypeMeta:   types.TypeMeta{Kind: types.ResourceKindNode},
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
					Ready: v1.ConditionUnknown,
				},
				PodCIDR:       "127.0.0.1",
				ProviderID:    "ID-1",
				Unschedulable: true,
				PodList: pod.PodList{
					Pods:              []pod.Pod{},
					Errors:            []error{},
					CumulativeMetrics: make([]metricapi.Metric, 0),
				},
				EventList: common.EventList{
					Events: make([]common.Event, 0),
				},
				Metrics: make([]metricapi.Metric, 0),
				Errors:  []error{},
			},
		},
	}

	for _, c := range cases {
		fakeClient := fake.NewSimpleClientset(c.node)

		dataselect.StdMetricsDataSelect.MetricQuery = dataselect.NoMetrics
		actual, _ := GetNodeDetail(fakeClient, nil, c.name, dataselect.NoDataSelect)

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetNodeDetail(client,metricClient,%#v, %#v) == \ngot: %#v, \nexpected %#v",
				c.namespace, c.name, actual, c.expected)
		}
	}
}
