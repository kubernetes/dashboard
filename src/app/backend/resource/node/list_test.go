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

	"github.com/kubernetes/dashboard/src/app/backend/api"
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
	"github.com/kubernetes/dashboard/src/app/backend/resource/dataselect"
	v1 "k8s.io/api/core/v1"
	metaV1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes/fake"
)

func TestGetNodeList(t *testing.T) {
	cases := []struct {
		node     *v1.Node
		expected *NodeList
	}{
		{
			&v1.Node{
				ObjectMeta: metaV1.ObjectMeta{Name: "test-node"},
				Spec: v1.NodeSpec{
					Unschedulable: true,
				},
			},
			&NodeList{
				ListMeta: api.ListMeta{
					TotalItems: 1,
				},
				Errors:            []error{},
				CumulativeMetrics: make([]metricapi.Metric, 0),
				Nodes: []Node{{
					ObjectMeta: api.ObjectMeta{Name: "test-node"},
					TypeMeta:   api.TypeMeta{Kind: api.ResourceKindNode},
					Ready:      "Unknown",
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
				},
				},
			},
		},
	}

	for _, c := range cases {
		fakeClient := fake.NewSimpleClientset(c.node)
		actual, _ := GetNodeList(fakeClient, dataselect.NoDataSelect, nil)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("GetNodeList() == \ngot: %#v, \nexpected %#v", actual, c.expected)
		}
	}
}
