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
