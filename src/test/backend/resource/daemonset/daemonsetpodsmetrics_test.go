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

package daemonset

import (
	"reflect"
	"testing"

	"github.com/kubernetes/dashboard/resource/replicationcontroller"
	heapster "k8s.io/heapster/api/v1/types"
)

func TestCreateResponseforDS(t *testing.T) {
	var cpuUsage1 uint64 = 1
	var cpuUsage2 uint64 = 2
	var memoryUsage uint64 = 6131712
	cases := []struct {
		cpuMetrics []heapster.MetricResult
		memMetrics []heapster.MetricResult
		podNames   []string
		expected   *DaemonSetMetricsByPod
	}{
		{make([]heapster.MetricResult, 0), make([]heapster.MetricResult, 0), make([]string, 0),
			&DaemonSetMetricsByPod{
				MetricsMap: map[string]replicationcontroller.PodMetrics{},
			}},
		{[]heapster.MetricResult{
			{Metrics: []heapster.MetricPoint{
				{Value: 0},
			}},
		},
			[]heapster.MetricResult{
				{Metrics: []heapster.MetricPoint{
					{Value: 6131712},
				}},
			},
			[]string{"a", "b"},
			&DaemonSetMetricsByPod{
				MetricsMap: map[string]replicationcontroller.PodMetrics{},
			},
		},
		{[]heapster.MetricResult{
			{Metrics: []heapster.MetricPoint{
				{Value: cpuUsage1},
			}},
			{Metrics: []heapster.MetricPoint{
				{Value: cpuUsage2},
			}},
		},
			[]heapster.MetricResult{
				{Metrics: []heapster.MetricPoint{
					{Value: memoryUsage},
				}},
				{Metrics: []heapster.MetricPoint{
					{Value: memoryUsage},
				}},
			},
			[]string{"a", "b"},
			&DaemonSetMetricsByPod{
				MetricsMap: map[string]replicationcontroller.PodMetrics{
					"a": {
						CpuUsage: &cpuUsage1,
						CpuUsageHistory: []replicationcontroller.MetricResult{
							{Value: cpuUsage1},
						},
						MemoryUsage: &memoryUsage,
						MemoryUsageHistory: []replicationcontroller.MetricResult{
							{Value: memoryUsage},
						},
					}, "b": {
						CpuUsage: &cpuUsage2,
						CpuUsageHistory: []replicationcontroller.MetricResult{
							{Value: cpuUsage2},
						},
						MemoryUsage: &memoryUsage,
						MemoryUsageHistory: []replicationcontroller.MetricResult{
							{Value: memoryUsage},
						},
					},
				},
			},
		},
	}
	for _, c := range cases {
		actual := createResponseforDS(c.cpuMetrics, c.memMetrics, c.podNames)

		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("createResponse(%#v, %#v, %#v) == %#v, expected %#v",
				c.cpuMetrics, c.memMetrics, c.podNames, actual, c.expected)
		}
	}
}
