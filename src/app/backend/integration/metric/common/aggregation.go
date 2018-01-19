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

package common

import (
	"sort"

	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
)

// SortableInt64 implements sort.Interface for []int64. This allows to use built in sort with int64.
type SortableInt64 []int64

func (a SortableInt64) Len() int           { return len(a) }
func (a SortableInt64) Swap(i, j int)      { a[i], a[j] = a[j], a[i] }
func (a SortableInt64) Less(i, j int) bool { return a[i] < a[j] }

// AggregateData aggregates all the data from dataList using AggregatingFunction with name aggregateName.
// Standard data aggregation function.
func AggregateData(metricList []metricapi.Metric, metricName string,
	aggregationName metricapi.AggregationMode) metricapi.Metric {
	_, isAggregateAvailable := metricapi.AggregatingFunctions[aggregationName]
	if !isAggregateAvailable {
		aggregationName = metricapi.DefaultAggregation
	}

	aggrMap, newLabel := AggregatingMapFromDataList(metricList, metricName)
	Xs := SortableInt64{}
	for k := range aggrMap {
		Xs = append(Xs, k)
	}
	newDataPoints := []metricapi.DataPoint{}
	sort.Sort(Xs) // ensure X data points are sorted
	for _, x := range Xs {
		y := metricapi.AggregatingFunctions[aggregationName](aggrMap[x])
		newDataPoints = append(newDataPoints, metricapi.DataPoint{X: x, Y: y})
	}

	// We need metric points for sparklines so we can't aggregate them as they are per
	// resource metrics already. Provide them only if aggregate is run on single resource.
	metricPoints := []metricapi.MetricPoint{}
	if len(metricList) == 1 {
		metricPoints = metricList[0].MetricPoints
	}

	// Create new data cell
	return metricapi.Metric{
		DataPoints:   newDataPoints,
		MetricPoints: metricPoints,
		MetricName:   metricName,
		Label:        newLabel,
		Aggregate:    aggregationName,
	}

}

// AggregatingMapFromDataList for all Data entries of given metric generates a cumulative map X -> [List of all Ys at this X].
// Afterwards this list of Ys can be easily aggregated.
func AggregatingMapFromDataList(metricList []metricapi.Metric, metricName string) (
	map[int64][]int64, metricapi.Label) {
	newLabel := metricapi.Label{}

	aggrMap := make(map[int64][]int64, 0)
	for _, data := range metricList {
		if data.MetricName != metricName {
			continue
		}
		newLabel = newLabel.AddMetricLabel(data.Label) // update label of resulting data
		for _, dataPoint := range data.DataPoints {
			_, isXPresent := aggrMap[dataPoint.X]
			if !isXPresent {
				aggrMap[dataPoint.X] = []int64{}
			}
			aggrMap[dataPoint.X] = append(aggrMap[dataPoint.X], dataPoint.Y)
		}

	}
	return aggrMap, newLabel
}

// AggregateMetricPromises aggregates all data from metric promises using AggregatingFunction
// with name aggregateName.
func AggregateMetricPromises(metricPromises metricapi.MetricPromises, metricName string,
	aggregations metricapi.AggregationModes, forceLabel metricapi.Label) metricapi.MetricPromises {
	if aggregations == nil || len(aggregations) == 0 {
		aggregations = metricapi.OnlyDefaultAggregation
	}
	result := metricapi.NewMetricPromises(len(aggregations))
	go func() {
		metricList, err := metricPromises.GetMetrics()
		if err != nil {
			result.PutMetrics(metricList, err)
			return
		}
		aggrResult := []metricapi.Metric{}
		for _, aggregation := range aggregations {
			aggregated := AggregateData(metricList, metricName, aggregation)
			if forceLabel != nil {
				aggregated.Label = forceLabel
			}
			aggrResult = append(aggrResult, aggregated)
		}
		result.PutMetrics(aggrResult, nil)
	}()
	return result
}
