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

package sidecar

import (
	"github.com/kubernetes/dashboard/src/app/backend/api"
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
)

// SidecarAllInOneDownloadConfig holds config information specifying whether given native Sidecar
// resource type supports list download.
var SidecarAllInOneDownloadConfig = map[api.ResourceKind]bool{
	api.ResourceKindPod:  true,
	api.ResourceKindNode: false,
}

// DataPointsFromMetricJSONFormat converts all the data points from format used by sidecar to our
// format.
func DataPointsFromMetricJSONFormat(raw []metricapi.MetricPoint) (dp metricapi.DataPoints) {
	for _, point := range raw {
		converted := metricapi.DataPoint{
			X: point.Timestamp.Unix(),
			Y: int64(point.Value),
		}

		if converted.Y < 0 {
			converted.Y = 0
		}

		dp = append(dp, converted)
	}
	return
}
