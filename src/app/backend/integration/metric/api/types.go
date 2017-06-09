package api

import (
	"time"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	integrationapi "github.com/kubernetes/dashboard/src/app/backend/integration/api"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/client-go/pkg/api/v1"
)

type MetricClient interface {
	// Metric API methods required to show graphs and sparklines on pod list
	DownloadMetric(selectors []ResourceSelector, metricName string,
		cachedResources *CachedResources) MetricPromises
	DownloadMetrics(selectors []ResourceSelector, metricNames []string,
		cachedResources *CachedResources) MetricPromises
	AggregateMetrics(metrics MetricPromises, metricName string,
		aggregations AggregationModes) MetricPromises

	// Implements IntegrationApp interface
	integrationapi.Integration
}

// CachedResources contains all resources that may be required by DataSelect functions for metric
// gathering. Depending on the need you may have to provide DataSelect with resources it
// requires, for example resource like deployment will need Pods in order to calculate its metrics.
type CachedResources struct {
	Pods []v1.Pod
	// More cached resources can be added.
	// For example, if you want to use Events from DataSelect, you will have to add them here.
}

var NoResourceCache = &CachedResources{}

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

var AggregatingFunctions = map[AggregationMode]func([]int64) int64{
	SumAggregation: SumAggregate,
	MaxAggregation: MaxAggregate,
	MinAggregation: MinAggregate,
}

// DerivedResources is a map from a derived resource(a resource that is not supported by heapster)
// to native resource (supported by heapster) to which derived resource should be converted.
// For example, deployment is not available in heapster so it has to be converted to its pods before downloading any data.
// Hence deployments map to pods.
var DerivedResources = map[api.ResourceKind]api.ResourceKind{
	api.ResourceKindDeployment:            api.ResourceKindPod,
	api.ResourceKindReplicaSet:            api.ResourceKindPod,
	api.ResourceKindReplicationController: api.ResourceKindPod,
	api.ResourceKindDaemonSet:             api.ResourceKindPod,
	api.ResourceKindStatefulSet:           api.ResourceKindPod,
	api.ResourceKindJob:                   api.ResourceKindPod,
}

// ResourceSelector is a structure used to quickly and uniquely identify given resource.
// This struct can be later used for heapster data download etc.
type ResourceSelector struct {
	// Namespace of this resource.
	Namespace string
	// Type of this resource
	ResourceType api.ResourceKind
	// Name of this resource.
	ResourceName string
	// Selector used to identify this resource (should be used only for Deployments!).
	Selector map[string]string
	// UID is resource unique identifier.
	UID types.UID
}

const (
	CpuUsage    = "cpu/usage_rate"
	MemoryUsage = "memory/usage"
)

type DataPoints []DataPoint

type DataPoint struct {
	X int64 `json:"x"`
	Y int64 `json:"y"`
}

type MetricPoint struct {
	Timestamp time.Time `json:"timestamp"`
	Value     uint64    `json:"value"`
}

// TODO refactor this to use types.UID instead of a string.
// Label stores information about identity of resources (UIDs) described by this metric.
type Label map[api.ResourceKind][]string

// AddMetricLabel returns a combined Label of self and other resource. (new label describes both resources).
func (self Label) AddMetricLabel(other Label) Label {
	if other == nil {
		return self
	}
	for k, v := range other {
		self[k] = append(self[k], v...)
	}
	return self
}

// Metric is a format of data used in this module. This is also the format of data that is being sent by backend API.
type Metric struct {
	// DataPoints is a list of X, Y int64 data points, sorted by X.
	DataPoints `json:"dataPoints"`
	// MetricPoints is a list of value, timestamp metrics used for sparklines on a pod list page.
	MetricPoints []MetricPoint `json:"metricPoints"`
	// MetricName is the name of metric stored in this struct.
	MetricName string `json:"metricName"`
	// TODO refactor this to use types.UID instead of a string.
	// Label stores information about identity of resources (UIDS) described by this metric.
	Label `json:"-"`
	// Names of aggregating function used.
	Aggregate AggregationMode `json:"aggregation,omitempty"`
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

// NewMetricPromise creates a MetricPromise structure with both channels of length 1.
func NewMetricPromise() MetricPromise {
	return MetricPromise{
		Metric: make(chan *Metric, 1),
		Error:  make(chan error, 1),
	}
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

// PutMetrics forwards provided list of metrics to all channels. If provided err is not nil, error will be forwarded.
func (self MetricPromises) PutMetrics(metrics []Metric, err error) {
	for i, metricPromise := range self {
		if err != nil {
			metricPromise.Metric <- nil
		} else {
			metricPromise.Metric <- &metrics[i]
		}
		metricPromise.Error <- err
	}
}

// NewMetricPromises returns a list of MetricPromises with requested length.
func NewMetricPromises(length int) MetricPromises {
	result := make(MetricPromises, length)
	for i := 0; i < length; i++ {
		result[i] = NewMetricPromise()
	}
	return result
}

// Implement aggregating functions:

func SumAggregate(values []int64) int64 {
	result := int64(0)
	for _, e := range values {
		result += e
	}
	return result
}

func MaxAggregate(values []int64) int64 {
	result := values[0]
	for _, e := range values {
		if e > result {
			result = e
		}
	}
	return result
}

func MinAggregate(values []int64) int64 {
	result := values[0]
	for _, e := range values {
		if e < result {
			result = e
		}
	}
	return result
}
