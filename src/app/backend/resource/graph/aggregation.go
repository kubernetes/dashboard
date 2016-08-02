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

package graph

import (
	"sort"
)

// Aggregate modes which should be used for data aggregation. Eg. [sum, min, max].
type Aggregate []string

var AggregatingFunctions = map[string]func([]int64) (int64){
	"sum": SumAggregate,
	"max": MaxAggregate,
	"min": MinAggregate,
	"default": SumAggregate,
}

// SortableInt64 implements sort.Interface for []int64. This allows to use built in sort with int64.
type SortableInt64 []int64
func (a SortableInt64) Len() int {return len(a)}
func (a SortableInt64) Swap(i, j int) {a[i], a[j] = a[j], a[i]}
func (a SortableInt64) Less(i, j int) bool {return a[i] < a[j]}


// AggregateData aggregates all the data from dataList using AggregatingFunction with name aggregateName.
// Standard data aggregation function.
func AggregateData(dataList DataList, metrics Metrics, aggregateName string, drill *Drill) (DataList) {
	_, isAggregateAvailable := AggregatingFunctions[aggregateName]
	if !isAggregateAvailable {
		aggregateName = "default"
	}
	newDataList := DataList{}
	for _, metric := range metrics {
		aggrMap := AggregatingMapFromDataList(dataList, metric)
		Xs := SortableInt64{}
		for k, _ := range aggrMap {
			Xs = append(Xs, k)
		}
		newDataPoints := []DataPoint{}
		sort.Sort(Xs) // ensure X data points are sorted
		for _, x := range Xs {
			y := AggregatingFunctions[aggregateName](aggrMap[x])
			newDataPoints = append(newDataPoints, DataPoint{x, y})
		}

		// Create new data cell
		newData := Data{
			Metric: metric,
			Drill: *drill,
			DataPoints: newDataPoints,
			Aggregate: aggregateName,
		}
		newDataList = append(newDataList, newData)
	}
	return newDataList
}

// AggregatingMapFromDataList for all Data entries of given metric generates a cumulative map X -> [List of all Ys at this X].
// Afterwards this list of Ys can be easily aggregated.
func AggregatingMapFromDataList(dataList DataList, metric string) (map[int64][]int64){
	aggrMap := make(map[int64][]int64, 0)
	for _, data := range dataList {
		if data.Metric != metric {
			continue
		}
		for _, dataPoint := range data.DataPoints {
			_, isXPresent := aggrMap[dataPoint.X]
			if !isXPresent {
				aggrMap[dataPoint.X] = []int64{}
			}
			aggrMap[dataPoint.X] = append(aggrMap[dataPoint.X], dataPoint.Y)
		}

	}
	return aggrMap
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
