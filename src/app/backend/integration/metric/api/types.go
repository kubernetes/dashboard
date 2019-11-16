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

package api

import (
	"fmt"
	"time"

	"github.com/kubernetes/dashboard/src/app/backend/api"
	integrationapi "github.com/kubernetes/dashboard/src/app/backend/integration/api"
	v1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/types"
)

// MetricClient is an interface that exposes API used by dashboard to show graphs and sparklines.
type MetricClient interface {
	// DownloadMetric returns MetricPromises for specified list of selector, for single type
	// of metric, i.e. cpu usage. Cached resources is usually list of pods as other high level
	// resources do not directly provide metrics. Only pods targeted by them.
	DownloadMetric(selectors []ResourceSelector, metricName string,
		cachedResources *CachedResources) MetricPromises
	// DownloadMetrics is similar to DownloadMetric method. It returns MetricPromises for
	// given list of metrics, i.e. cpu/memory usage instead of single metric type.
	DownloadMetrics(selectors []ResourceSelector, metricNames []string,
		cachedResources *CachedResources) MetricPromises
	// AggregateMetrics is used to aggregate previously downloaded metrics based on
	// aggregation mode (sum, min, avg). It is used to show cumulative metric graphs on
	// resource list pages.
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

// AggregationMode informs how data should be aggregated (sum, min, max)
type AggregationMode string

// Aggregation modes which should be used for data aggregation. Eg. [sum, min, max].
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

// Label stores information about identity of resources (UIDs) described by metric.
type Label map[api.ResourceKind][]types.UID

// AddMetricLabel returns a unique combined Label of self and other resource.
// New label describes both resources.
func (self Label) AddMetricLabel(other Label) Label {
	if other == nil {
		return self
	}

	uniqueMap := map[types.UID]bool{}
	for _, v := range self {
		for _, t := range v {
			uniqueMap[t] = true
		}
	}

	for k, v := range other {
		for _, t := range v {
			if _, exists := uniqueMap[t]; !exists {
				self[k] = append(self[k], t)
			}
		}
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
	// Label stores information about identity of resources (UIDS) described by this metric.
	Label `json:"-"`
	// Names of aggregating function used.
	Aggregate AggregationMode `json:"aggregation,omitempty"`
}

// SidecarMetric is a format of data used by our sidecar. This is also the format of data that is being sent by backend API.
type SidecarMetric struct {
	// DataPoints is a list of X, Y int64 data points, sorted by X.
	DataPoints `json:"dataPoints"`
	// MetricPoints is a list of value, timestamp metrics used for sparklines on a pod list page.
	MetricPoints []MetricPoint `json:"metricPoints"`
	// MetricName is the name of metric stored in this struct.
	MetricName string `json:"metricName"`
	// Label stores information about identity of resources (UIDS) described by this metric.
	UIDs []string `json:"uids"`
}

type SidecarMetricResultList struct {
	Items []SidecarMetric `json:"items"`
}

type MetricResultList struct {
	Items []Metric `json:"items"`
}

func (metric *SidecarMetric) AddMetricPoint(item MetricPoint) []MetricPoint {
	metric.MetricPoints = append(metric.MetricPoints, item)
	return metric.MetricPoints
}

func (metric *Metric) AddMetricPoint(item MetricPoint) []MetricPoint {
	metric.MetricPoints = append(metric.MetricPoints, item)
	return metric.MetricPoints
}

// String implements stringer interface to allow easy printing
func (self Metric) String() string {
	return "{\nDataPoints: " + fmt.Sprintf("%v", self.DataPoints) +
		"\nMetricPoints: " + fmt.Sprintf("%v", self.MetricPoints) +
		"\nMetricName: " + self.MetricName +
		"\nLabel: " + fmt.Sprintf("%v", self.Label) +
		"\nAggregate: " + fmt.Sprintf("%v", self.Aggregate)
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
			// Do not fail when cannot resolve one of the metrics promises and return what can be resolved.
			continue
		}

		if metric == nil {
			continue
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
