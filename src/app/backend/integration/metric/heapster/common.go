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

package heapster

import (
  metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
  heapster "k8s.io/heapster/metrics/api/v1/types"
)

func toMetricPoints(heapsterMetricPoint []heapster.MetricPoint) []metricapi.MetricPoint {
	metricPoints := make([]metricapi.MetricPoint, len(heapsterMetricPoint))
	for i, heapsterMP := range heapsterMetricPoint {
		metricPoints[i] = metricapi.MetricPoint{
			Value:     heapsterMP.Value,
			Timestamp: heapsterMP.Timestamp,
		}
	}

	return metricPoints
}
