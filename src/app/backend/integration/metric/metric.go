package metric

import "github.com/kubernetes/dashboard/src/app/backend/resource/common"

const (
	CpuUsage    = "cpu/usage_rate"
	MemoryUsage = "memory/usage"
)

type DataPoints []DataPoint

type DataPoint struct {
	X int64 `json:"x"`
	Y int64 `json:"y"`
}

// Label stores information about identity of resources described by this metric.
type Label map[common.ResourceKind][]string

// Aggregation modes which should be used for data aggregation. Eg. [sum, min, max].
type AggregationMode string

const (
	SumAggregation     = "sum"
	MaxAggregation     = "max"
	MinAggregation     = "min"
	DefaultAggregation = SumAggregation
)

type AggregationModes []AggregationMode

var OnlySumAggregation = AggregationModes{SumAggregation}
var OnlyDefaultAggregation = AggregationModes{DefaultAggregation}

// Metric is a format of data used in this module. This is also the format of data that is being sent by backend API.
type Metric struct {
	// DataPoints is a list of X, Y int64 data points, sorted by X.
	DataPoints `json:"dataPoints"`
	// MetricName is the name of metric stored in this struct.
	MetricName string `json:"metricName"`
	// Label stores information about identity of resources described by this metric.
	Label `json:"-"`
	// Names of aggregating function used.
	Aggregate  AggregationMode `json:"aggregation,omitempty"`
}

// MetricPromise is used for parallel data extraction. Contains len 1 channels for Metric and Error.
type MetricPromise struct {
	Metric chan *Metric
	Error  chan error
}

// GetMetric returns pointer to received Metrics and forwarded error (if any)
func (self MetricPromise) GetMetric() (*Metric, error) {
	err := <-self.Error
	if err != nil {
		return nil, err
	}
	return <-self.Metric, nil
}

type MetricPromises []MetricPromise

// GetMetrics returns all metrics from MetricPromises.
// In case of no metrics were downloaded it does not initialise []Metric and returns nil.
func (self MetricPromises) GetMetrics() ([]Metric, error) {
	result := make([]Metric, 0)

	for _, metricPromise := range self {
		metric, err := metricPromise.GetMetric()
		if err != nil {
			return nil, err
		}
		result = append(result, *metric)
	}

	return result, nil
}