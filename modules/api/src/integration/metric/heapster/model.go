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
	"github.com/kubernetes/dashboard/src/app/backend/api"
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
	heapster "k8s.io/heapster/metrics/api/v1/types"
)

// HeapsterAllInOneDownloadConfig holds config information specifying whether given native Heapster
// resource type supports list download.
var HeapsterAllInOneDownloadConfig = map[api.ResourceKind]bool{
	api.ResourceKindPod:  true,
	api.ResourceKindNode: false,
}

// DataPointsFromMetricJSONFormat converts all the data points from format used by heapster to our
// format.
func DataPointsFromMetricJSONFormat(raw heapster.MetricResult) (dp metricapi.DataPoints) {
	for _, raw := range raw.Metrics {
		converted := metricapi.DataPoint{
			X: raw.Timestamp.Unix(),
			Y: int64(raw.Value),
		}

		if converted.Y < 0 {
			converted.Y = 0
		}

		dp = append(dp, converted)
	}
	return
}
