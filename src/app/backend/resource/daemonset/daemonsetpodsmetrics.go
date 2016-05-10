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

	"github.com/kubernetes/dashboard/client"
	"github.com/kubernetes/dashboard/resource/common"
	"github.com/kubernetes/dashboard/resource/replicationcontroller"
	heapster "k8s.io/heapster/api/v1/types"
	"k8s.io/kubernetes/pkg/api"
)

// Metrics map by pod name.
type DaemonSetMetricsByPod struct {
	// Metrics map by pod name
	MetricsMap map[string]common.PodMetrics `json:"metricsMap"`
}

// Return Pods metrics for Daemon Set or error when occurred.
func getDaemonSetPodsMetrics(podList *api.PodList, heapsterClient client.HeapsterClient,
	namespace string, daemonSet string) (*DaemonSetMetricsByPod, error) {
	log.Printf("Getting Pods metrics for Daemon Set %s in %s namespace", daemonSet, namespace)
	podNames := make([]string, 0)

	pods := podList.Items
	for _, pod := range pods {
		podNames = append(podNames, pod.Name)
	}

	metricCpuUsagePath := replicationcontroller.CreateMetricPath(namespace, podNames, common.CpuUsage)
	metricMemUsagePath := replicationcontroller.CreateMetricPath(namespace, podNames, common.MemoryUsage)

	resultCpuUsageRaw, err := replicationcontroller.GetRawMetrics(heapsterClient, metricCpuUsagePath)
	if err != nil {
		return nil, err
	}

	resultMemUsageRaw, err := replicationcontroller.GetRawMetrics(heapsterClient, metricMemUsagePath)
	if err != nil {
		return nil, err
	}

	cpuMetricResult, err := replicationcontroller.UnmarshalMetrics(resultCpuUsageRaw)
	if err != nil {
		return nil, err
	}
	memMetricResult, err := replicationcontroller.UnmarshalMetrics(resultMemUsageRaw)
	if err != nil {
		return nil, err
	}
	return createResponse(cpuMetricResult, memMetricResult, podNames), nil
}

// Create response structure for API call.
func createResponse(cpuMetrics []heapster.MetricResult, memMetrics []heapster.MetricResult,
	podNames []string) *DaemonSetMetricsByPod {

	return &DaemonSetMetricsByPod{
		MetricsMap: common.GetPodMetrics(cpuMetrics, memMetrics, podNames),
	}
}
