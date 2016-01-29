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

package main

import (
	"log"

	"encoding/json"
	"fmt"
	"strings"

	heapster "k8s.io/heapster/api/v1/types"
	"k8s.io/kubernetes/pkg/api"
)

const (
	cpuUsage    = "cpu-usage"
	memoryUsage = "memory-usage"
)

// Metrics map by pod name.
type ReplicaSetMetricsByPod struct {
	// Metrics map by pod name
	MetricsMap map[string]PodMetrics `json:"metricsMap"`
}

// Pod metrics structure.
type PodMetrics struct {
	// Cumulative CPU usage on all cores in nanoseconds.
	CpuUsage *uint64 `json:"cpuUsage"`
	// Pod memory usage in bytes.
	MemoryUsage *uint64 `json:"memoryUsage"`
}

// Return Pods metrics for Replica Set or error when occurred.
func getReplicaSetPodsMetrics(podList *api.PodList, heapsterClient HeapsterClient,
	namespace string, replicaSet string) (*ReplicaSetMetricsByPod, error) {
	log.Printf("Getting Pods metrics for Replica Set %s in %s namespace", replicaSet, namespace)
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

	resultRaw, err := heapsterClient.Get().Suffix(metricPath).DoRaw()

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
	podNames []string) *ReplicaSetMetricsByPod {
	replicaSetPodsResources := make(map[string]PodMetrics)

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
			podResources := PodMetrics{
				CpuUsage:    cpuValue,
				MemoryUsage: memValue,
			}
			replicaSetPodsResources[podName] = podResources
		}
	}
	return &ReplicaSetMetricsByPod{
		MetricsMap: replicaSetPodsResources,
	}
}
