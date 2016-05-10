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

	"github.com/kubernetes/dashboard/resource/common"
	// TODO(maciaszczykm): Avoid using dot-imports.
	. "github.com/kubernetes/dashboard/client"
	heapster "k8s.io/heapster/api/v1/types"
	"k8s.io/kubernetes/pkg/api"
)

// ReplicationControllerMetricsByPod is a metrics map by pod name.
type ReplicationControllerMetricsByPod struct {
	// Metrics map by pod name
	MetricsMap map[string]common.PodMetrics `json:"metricsMap"`
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

	metricCpuUsagePath := CreateMetricPath(namespace, podNames, common.CpuUsage)
	metricMemUsagePath := CreateMetricPath(namespace, podNames, common.MemoryUsage)

	resultCpuUsageRaw, err := GetRawMetrics(heapsterClient, metricCpuUsagePath)
	if err != nil {
		return nil, err
	}

	resultMemUsageRaw, err := GetRawMetrics(heapsterClient, metricMemUsagePath)
	if err != nil {
		return nil, err
	}

	cpuMetricResult, err := UnmarshalMetrics(resultCpuUsageRaw)
	if err != nil {
		return nil, err
	}
	memMetricResult, err := UnmarshalMetrics(resultMemUsageRaw)
	if err != nil {
		return nil, err
	}
	return createResponse(cpuMetricResult, memMetricResult, podNames), nil
}

// Create URL path for metrics.
func CreateMetricPath(namespace string, podNames []string, metricName string) string {
	return fmt.Sprintf("/model/namespaces/%s/pod-list/%s/metrics/%s",
		namespace,
		strings.Join(podNames, ","),
		metricName)
}

// Retrieves raw metrics from Heapster.
func GetRawMetrics(heapsterClient HeapsterClient, metricPath string) ([]byte, error) {
	resultRaw, err := heapsterClient.Get(metricPath).DoRaw()

	if err != nil {
		return make([]byte, 0), err
	}
	return resultRaw, nil
}

// Deserialize raw metrics to object.
func UnmarshalMetrics(rawData []byte) ([]heapster.MetricResult, error) {
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

	return &ReplicationControllerMetricsByPod{
		MetricsMap: common.GetPodMetrics(cpuMetrics, memMetrics, podNames),
	}
}
