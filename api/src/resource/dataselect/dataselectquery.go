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

package dataselect

import (
	metricapi "github.com/kubernetes/dashboard/src/app/backend/integration/metric/api"
)

// DataSelectQuery is options for GenericDataSelect which takes []GenericDataCell and returns selected data.
// Can be extended to include any kind of selection - for example filtering.
// Currently included only Pagination and Sort options.
type DataSelectQuery struct {
	PaginationQuery *PaginationQuery
	SortQuery       *SortQuery
	FilterQuery     *FilterQuery
	MetricQuery     *MetricQuery
}

var NoMetrics = NewMetricQuery(nil, nil)

// StandardMetrics query results in a standard metrics being returned.
// standard metrics are: cpu usage, memory usage and aggregation = sum.
var StandardMetrics = NewMetricQuery([]string{metricapi.CpuUsage, metricapi.MemoryUsage},
	metricapi.OnlySumAggregation)

// MetricQuery holds parameters for metric extraction process.
// It accepts list of metrics to be downloaded and a list of aggregations that should be performed for each metric.
// Query has this format  metrics=metric1,metric2,...&aggregations=aggregation1,aggregation2,...
type MetricQuery struct {
	// Metrics to download, all available metric names can be found here:
	// https://github.com/kubernetes/heapster/blob/master/docs/storage-schema.md
	MetricNames []string
	// Aggregations to be performed for each metric. Check available aggregations in aggregation.go.
	// If empty, default aggregation will be used (sum).
	Aggregations metricapi.AggregationModes
}

// NewMetricQuery returns a metric query from provided settings.
func NewMetricQuery(metricNames []string, aggregations metricapi.AggregationModes) *MetricQuery {
	return &MetricQuery{
		MetricNames:  metricNames,
		Aggregations: aggregations,
	}
}

// SortQuery holds options for sort functionality of data select.
type SortQuery struct {
	SortByList []SortBy
}

// SortBy holds the name of the property that should be sorted and whether order should be ascending or descending.
type SortBy struct {
	Property  PropertyName
	Ascending bool
}

// NoSort is as option for no sort.
var NoSort = &SortQuery{
	SortByList: []SortBy{},
}

type FilterQuery struct {
	FilterByList []FilterBy
}

type FilterBy struct {
	Property PropertyName
	Value    ComparableValue
}

var NoFilter = &FilterQuery{
	FilterByList: []FilterBy{},
}

// NoDataSelect is an option for no data select (same data will be returned).
var NoDataSelect = NewDataSelectQuery(NoPagination, NoSort, NoFilter, NoMetrics)

// StdMetricsDataSelect does not perform any data select, just downloads standard metrics.
var StdMetricsDataSelect = NewDataSelectQuery(NoPagination, NoSort, NoFilter, StandardMetrics)

// DefaultDataSelect downloads first 10 items from page 1 with no sort and no metrics.
var DefaultDataSelect = NewDataSelectQuery(DefaultPagination, NoSort, NoFilter, NoMetrics)

// DefaultDataSelectWithMetrics downloads first 10 items from page 1 with no sort. Also downloads and includes standard metrics.
var DefaultDataSelectWithMetrics = NewDataSelectQuery(DefaultPagination, NoSort, NoFilter, StandardMetrics)

// NewDataSelectQuery creates DataSelectQuery object from simpler data select queries.
func NewDataSelectQuery(paginationQuery *PaginationQuery, sortQuery *SortQuery, filterQuery *FilterQuery, graphQuery *MetricQuery) *DataSelectQuery {
	return &DataSelectQuery{
		PaginationQuery: paginationQuery,
		SortQuery:       sortQuery,
		FilterQuery:     filterQuery,
		MetricQuery:     graphQuery,
	}
}

// NewSortQuery takes raw sort options list and returns SortQuery object. For example:
// ["a", "parameter1", "d", "parameter2"] - means that the data should be sorted by
// parameter1 (ascending) and later - for results that return equal under parameter 1 sort - by parameter2 (descending)
func NewSortQuery(sortByListRaw []string) *SortQuery {
	if sortByListRaw == nil || len(sortByListRaw)%2 == 1 {
		// Empty sort list or invalid (odd) length
		return NoSort
	}
	sortByList := []SortBy{}
	for i := 0; i+1 < len(sortByListRaw); i += 2 {
		// parse order option
		var ascending bool
		orderOption := sortByListRaw[i]
		if orderOption == "a" {
			ascending = true
		} else if orderOption == "d" {
			ascending = false
		} else {
			//  Invalid order option. Only ascending (a), descending (d) options are supported
			return NoSort
		}

		// parse property name
		propertyName := sortByListRaw[i+1]
		sortBy := SortBy{
			Property:  PropertyName(propertyName),
			Ascending: ascending,
		}
		// Add to the sort options.
		sortByList = append(sortByList, sortBy)
	}
	return &SortQuery{
		SortByList: sortByList,
	}
}

// NewFilterQuery takes raw filter options list and returns FilterQuery object. For example:
// ["parameter1", "value1", "parameter2", "value2"] - means that the data should be filtered by
// parameter1 equals value1 and parameter2 equals value2
func NewFilterQuery(filterByListRaw []string) *FilterQuery {
	if filterByListRaw == nil || len(filterByListRaw)%2 == 1 {
		return NoFilter
	}
	filterByList := []FilterBy{}
	for i := 0; i+1 < len(filterByListRaw); i += 2 {
		propertyName := filterByListRaw[i]
		propertyValue := filterByListRaw[i+1]
		filterBy := FilterBy{
			Property: PropertyName(propertyName),
			Value:    StdComparableString(propertyValue),
		}
		// Add to the filter options.
		filterByList = append(filterByList, filterBy)
	}
	return &FilterQuery{
		FilterByList: filterByList,
	}
}
