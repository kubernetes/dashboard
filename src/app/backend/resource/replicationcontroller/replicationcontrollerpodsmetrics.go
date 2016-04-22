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

package replicationcontroller

import (
	"log"

	"encoding/json"
	"fmt"
	"strings"
	"time"

	. "github.com/kubernetes/dashboard/client"
	heapster "k8s.io/heapster/api/v1/types"
	"k8s.io/kubernetes/pkg/api"
)

const (
	cpuUsage    = "cpu-usage"
	memoryUsage = "memory-usage"
)

// ReplicationControllerMetricsByPod is a metrics map by pod name.
type ReplicationControllerMetricsByPod struct {
	// Metrics map by pod name
	MetricsMap map[string]PodMetrics `json:"metricsMap"`
}

// MetricResult is a some sample measurement of a non-negative, integer quantity
// (for example, memory usage in bytes observed at some moment)
type MetricResult struct {
	Timestamp time.Time `json:"timestamp"`
	Value     uint64    `json:"value"`
}

// PodMetrics is a structure representing pods metrics, contains information about CPU and memory
// usage.
type PodMetrics struct {
	// Most recent measure of CPU usage on all cores in nanoseconds.
	CpuUsage *uint64 `json:"cpuUsage"`
	// Pod memory usage in bytes.
	MemoryUsage *uint64 `json:"memoryUsage"`
	// Timestamped samples of CpuUsage over some short period of history
	CpuUsageHistory []MetricResult `json:"cpuUsageHistory"`
	// Timestamped samples of pod memory usage over some short period of history
	MemoryUsageHistory []MetricResult `json:"memoryUsageHistory"`
}

// Return Pods metrics for Replication Controller or error when occurred.
func getReplicationControllerPodsMetrics(podList *api.PodList, heapsterClient HeapsterClient,
	namespace string, replicationController string) (*ReplicationControllerMetricsByPod, error) {
	log.Printf("Getting Pods metrics for Replication Controller %s in %s namespace", replicationController, namespace)
	podNames := make([]string, 0)

	pods := podList.Items
	for _, pod := range pods {
		podNames = append(podNames, pod.Name)
	}

	metricCpuUsagePath := createMetricPath(namespace, podNames, cpuUsage)
	metricMemUsagePath := createMetricPath(namespace, podNames, memoryUsage)

	resultCpuUsageRaw, err := getRawMetrics(heapsterClient, metricCpuUsagePath)
	if err != nil {
		return nil, err
	}

	resultMemUsageRaw, err := getRawMetrics(heapsterClient, metricMemUsagePath)
	if err != nil {
		return nil, err
	}

	cpuMetricResult, err := unmarshalMetrics(resultCpuUsageRaw)
	if err != nil {
		return nil, err
	}
	memMetricResult, err := unmarshalMetrics(resultMemUsageRaw)
	if err != nil {
		return nil, err
	}
	return createResponse(cpuMetricResult, memMetricResult, podNames), nil
}

// Create URL path for metrics.
func createMetricPath(namespace string, podNames []string, metricName string) string {
	return fmt.Sprintf("/model/namespaces/%s/pod-list/%s/metrics/%s",
		namespace,
		strings.Join(podNames, ","),
		metricName)
}

// Retrieves raw metrics from Heapster.
func getRawMetrics(heapsterClient HeapsterClient, metricPath string) ([]byte, error) {
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
func createResponse(cpuMetrics []heapster.MetricResult, memMetrics []heapster.MetricResult,
	podNames []string) *ReplicationControllerMetricsByPod {
	replicationControllerPodsResources := make(map[string]PodMetrics)

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

			podResources := PodMetrics{
				CpuUsage:           cpuValue,
				MemoryUsage:        memValue,
				CpuUsageHistory:    cpuHistory,
				MemoryUsageHistory: memHistory,
			}
			replicationControllerPodsResources[podName] = podResources
		}
	}
	return &ReplicationControllerMetricsByPod{
		MetricsMap: replicationControllerPodsResources,
	}
}
