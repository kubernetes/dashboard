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

type Aggregate []string

type SortableInt64 []int64
func (a SortableInt64) Len() int {return len(a)}
func (a SortableInt64) Swap(i, j int) {a[i], a[j] = a[j], a[i]}
func (a SortableInt64) Less(i, j int) bool {return a[i] < a[j]}

func AggregateData(dataList DataList, metrics Metrics, aggregateName string, drill *Drill) (DataList) {
	_, isAggregateAvailable := AggregatingFunctions[aggregateName]
	if !isAggregateAvailable {
		aggregateName = "default"
	}
	newDataList := DataList{}
	for _, metric := range metrics {
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
		Xs := SortableInt64{}
		for k, _ := range aggrMap {
			Xs = append(Xs, k)
		}
		newDataPoints := []DataPoint{}
		sort.Sort(Xs)
		for _, x := range Xs {
			y := AggregatingFunctions[aggregateName](aggrMap[x])
			newDataPoints = append(newDataPoints, DataPoint{x, y})
		}

		newData := Data{}
		newData.Metric = metric
		newData.Drill = *drill
		newData.DataPoints = newDataPoints
		newData.Aggregate = aggregateName

		newDataList = append(newDataList, newData)
	}
	return newDataList
}


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



var AggregatingFunctions = map[string]func([]int64) (int64){
	"sum": SumAggregate,
	"max": MaxAggregate,
	"min": MinAggregate,
	"default": SumAggregate,
	//"avg": AvgAggregate,
	//"var": VarAggregate,
	//"std": StdAggregate,
}
