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

package common

import (
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/kubernetes/dashboard/src/app/backend/client"

	heapster "k8s.io/heapster/metrics/api/v1/types"
)

const (
	CpuUsage    = "cpu/usage_rate"
	MemoryUsage = "memory/usage"
)

// MetricsByPod is a metrics map by pod name.
type MetricsByPod struct {
	// Metrics by namespace and name of a pod.
	MetricsMap map[string]map[string]PodMetrics `json:"metricsMap"`
}

// MetricResult is a some sample measurement of a non-negative, integer quantity (for example,
// memory usage in bytes observed at some moment)
type MetricResult struct {
	Timestamp time.Time `json:"timestamp"`
	Value     uint64    `json:"value"`
}

// PodMetrics is a structure representing pods metrics, contains information about CPU and memory
// usage.
type PodMetrics struct {
	// Most recent measure of CPU usage on all cores in nanoseconds.
	CPUUsage *uint64 `json:"cpuUsage"`
	// Pod memory usage in bytes.
	MemoryUsage *uint64 `json:"memoryUsage"`
	// Timestamped samples of CPUUsage over some short period of history
	CPUUsageHistory []MetricResult `json:"cpuUsageHistory"`
	// Timestamped samples of pod memory usage over some short period of history
	MemoryUsageHistory []MetricResult `json:"memoryUsageHistory"`
}

// Return Pods metrics for the given list of pods. Returns error in case of errors when talking
// with heapster.
func getPodListMetrics(podNamesByNamespace map[string][]string,
	heapsterClient client.HeapsterClient) (*MetricsByPod, error) {
	log.Printf("Getting pod metrics")

	result := &MetricsByPod{MetricsMap: make(map[string]map[string]PodMetrics)}

	for namespace, podNames := range podNamesByNamespace {
		metricCPUUsagePath := createMetricPath(namespace, podNames, CpuUsage)
		metricMemUsagePath := createMetricPath(namespace, podNames, MemoryUsage)

		resultCPUUsageRaw, err := getRawMetrics(heapsterClient, metricCPUUsagePath)
		if err != nil {
			return nil, err
		}

		resultMemUsageRaw, err := getRawMetrics(heapsterClient, metricMemUsagePath)
		if err != nil {
			return nil, err
		}

		cpuMetricResult, err := unmarshalMetrics(resultCPUUsageRaw)
		if err != nil {
			return nil, err
		}
		memMetricResult, err := unmarshalMetrics(resultMemUsageRaw)
		if err != nil {
			return nil, err
		}

		if result.MetricsMap[namespace] == nil {
			result.MetricsMap[namespace] = make(map[string]PodMetrics)
		}

		fillPodMetrics(cpuMetricResult, memMetricResult, podNames,
			result.MetricsMap[namespace])
	}

	return result, nil
}

// Create URL path for metrics.
func createMetricPath(namespace string, podNames []string, metricName string) string {
	return fmt.Sprintf("/model/namespaces/%s/pod-list/%s/metrics/%s",
		namespace,
		strings.Join(podNames, ","),
		metricName)
}

// Retrieves raw metrics from Heapster.
func getRawMetrics(heapsterClient client.HeapsterClient, metricPath string) ([]byte, error) {
	resultRaw, err := heapsterClient.Get(metricPath).DoRaw()

	if err != nil {
		return make([]byte, 0), err
	}
	return resultRaw, nil
}

// Deserialize raw metrics to object.
func unmarshalMetrics(rawData []byte) ([]heapster.MetricResult, error) {
	metricResultList := &heapster.MetricResultList{}
	err := json.Unmarshal(rawData, metricResultList)
	if err != nil {
		return make([]heapster.MetricResult, 0), err
	}
	return metricResultList.Items, nil
}

// Create response structure for API call.
func fillPodMetrics(cpuMetrics []heapster.MetricResult, memMetrics []heapster.MetricResult,
	podNames []string, result map[string]PodMetrics) {
	if len(cpuMetrics) == len(podNames) && len(memMetrics) == len(podNames) {
		for iterator, podName := range podNames {
			var memValue *uint64
			var cpuValue *uint64
			memMetricsList := memMetrics[iterator].Metrics
			cpuMetricsList := cpuMetrics[iterator].Metrics

			if len(memMetricsList) > 0 {
				memValue = &memMetricsList[len(memMetricsList)-1].Value
			}

			if len(cpuMetricsList) > 0 {
				cpuValue = &cpuMetricsList[len(cpuMetricsList)-1].Value
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

			podResources := PodMetrics{
				CPUUsage:           cpuValue,
				MemoryUsage:        memValue,
				CPUUsageHistory:    cpuHistory,
				MemoryUsageHistory: memHistory,
			}
			result[podName] = podResources
		}
	}
}
