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
	"log"

	"github.com/kubernetes/dashboard/resource/replicationcontroller"
	heapster "k8s.io/heapster/api/v1/types"
	"k8s.io/kubernetes/pkg/api"
)

// Metrics map by pod name.
type DaemonSetMetricsByPod struct {
	// Metrics map by pod name
	MetricsMap map[string]replicationcontroller.PodMetrics `json:"metricsMap"`
}

// Return Pods metrics for Daemon Set or error when occurred.
func getDaemonSetPodsMetrics(podList *api.PodList, heapsterClient HeapsterClient,
	namespace string, daemonSet string) (*DaemonSetMetricsByPod, error) {
	log.Printf("Getting Pods metrics for Daemon Set %s in %s namespace", daemonSet, namespace)
	podNames := make([]string, 0)

	pods := podList.Items
	for _, pod := range pods {
		podNames = append(podNames, pod.Name)
	}

	metricCpuUsagePath := replicationcontroller.createMetricPath(namespace, podNames, cpuUsage)
	metricMemUsagePath := replicationcontroller.createMetricPath(namespace, podNames, memoryUsage)

	resultCpuUsageRaw, err := replicationcontroller.getRawMetrics(heapsterClient, metricCpuUsagePath)
	if err != nil {
		return nil, err
	}

	resultMemUsageRaw, err := replicationcontroller.getRawMetrics(heapsterClient, metricMemUsagePath)
	if err != nil {
		return nil, err
	}

	cpuMetricResult, err := replicationcontroller.unmarshalMetrics(resultCpuUsageRaw)
	if err != nil {
		return nil, err
	}
	memMetricResult, err := replicationcontroller.unmarshalMetrics(resultMemUsageRaw)
	if err != nil {
		return nil, err
	}
	return createResponseforDS(cpuMetricResult, memMetricResult, podNames), nil
}

// Create response structure for API call.
func createResponseforDS(cpuMetrics []heapster.MetricResult, memMetrics []heapster.MetricResult,
	podNames []string) *DaemonSetMetricsByPod {
	daemonSetPodsResources := make(map[string]PodMetrics)

	if len(cpuMetrics) == len(podNames) && len(memMetrics) == len(podNames) {
		for iterator, podName := range podNames {
			var memValue *uint64
			var cpuValue *uint64
			memMetricsList := memMetrics[iterator].Metrics
			cpuMetricsList := cpuMetrics[iterator].Metrics

			if len(memMetricsList) > 0 {
				memValue = &memMetricsList[0].Value
			}

			if len(cpuMetricsList) > 0 {
				cpuValue = &cpuMetricsList[0].Value
			}

			cpuHistory := make([]MetricResult, len(cpuMetricsList))
			memHistory := make([]MetricResult, len(memMetricsList))

			for i, cpuMeasure := range cpuMetricsList {
				cpuHistory[i].Value = cpuMeasure.Value
				cpuHistory[i].Timestamp = cpuMeasure.Timestamp
			}

			for i, memMeasure := range memMetricsList {
				memHistory[i].Value = memMeasure.Value
				memHistory[i].Timestamp = memMeasure.Timestamp
			}

			podResources := replicationcontroller.PodMetrics{
				CpuUsage:           cpuValue,
				MemoryUsage:        memValue,
				CpuUsageHistory:    cpuHistory,
				MemoryUsageHistory: memHistory,
			}
			daemonSetPodsResources[podName] = podResources
		}
	}
	return &DaemonSetMetricsByPod{
		MetricsMap: daemonSetPodsResources,
	}
}
