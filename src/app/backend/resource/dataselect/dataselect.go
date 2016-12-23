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

package dataselect

import (
	"fmt"
	"github.com/kubernetes/dashboard/src/app/backend/client"
	"github.com/kubernetes/dashboard/src/app/backend/resource/metric"
	"k8s.io/kubernetes/pkg/api"
	"sort"
)

// CachedResources contains all resources that may be required by DataSelect functions.
// Depending on the need you may have to provide DataSelect with resources it requires, for example
// resource like deployment will need Pods in order to calculate its metrics.
type CachedResources struct {
	Pods []api.Pod
	// More cached resources can be added.
	// For example, if you want to use Events from DataSelect, you will have to add them here.
}

var NoResourceCache = &CachedResources{}

// GenericDataCell describes the interface of the data cell that contains all the necessary methods needed to perform
// complex data selection
// GenericDataSelect takes a list of these interfaces and performs selection operation.
// Therefore as long as the list is composed of GenericDataCells you can perform any data selection!
type DataCell interface {
	// GetPropertyAtIndex returns the property of this data cell.
	// Value returned has to have Compare method which is required by Sort functionality of DataSelect.
	GetProperty(PropertyName) ComparableValue
}

// MetricDataCell extends interface of DataCells and additionally supports metric download.
type MetricDataCell interface {
	// GetPropertyAtIndex returns the property of this data cell.
	// Value returned has to have Compare method which is required by Sort functionality of DataSelect.
	GetProperty(PropertyName) ComparableValue
	// GetResourceSelector returns ResourceSelector for this resource. The ResourceSelector can be used to get,
	// HeapsterSelector which in turn can be used to download metrics.
	GetResourceSelector() *metric.ResourceSelector
}

// ComparableValue hold any value that can be compared to its own kind.
type ComparableValue interface {
	// Compares self with other value. Returns 1 if other value is smaller, 0 if they are the same, -1 if other is larger.
	Compare(ComparableValue) int
}

// SelectableData contains all the required data to perform data selection.
// It implements sort.Interface so its sortable under sort.Sort
// You can use its Select method to get selected GenericDataCell list.
type DataSelector struct {
	// GenericDataList hold generic data cells that are being selected.
	GenericDataList []DataCell
	// DataSelectQuery holds instructions for data select.
	DataSelectQuery *DataSelectQuery
	// CachedResources stores resources that may be needed during data selection process
	CachedResources *CachedResources
	// CumulativeMetricsPromises is a list of promises holding aggregated metrics for resources in GenericDataList.
	// The metrics will be calculated after calling GetCumulativeMetrics method.
	CumulativeMetricsPromises metric.MetricPromises
}

// Implementation of sort.Interface so that we can use built-in sort function (sort.Sort) for sorting SelectableData

// Len returns the length of data inside SelectableData.
func (self DataSelector) Len() int { return len(self.GenericDataList) }

// Swap swaps 2 indices inside SelectableData.
func (self DataSelector) Swap(i, j int) {
	self.GenericDataList[i], self.GenericDataList[j] = self.GenericDataList[j], self.GenericDataList[i]
}

// Less compares 2 indices inside SelectableData and returns true if first index is larger.
func (self DataSelector) Less(i, j int) bool {
	for _, sortBy := range self.DataSelectQuery.SortQuery.SortByList {
		a := self.GenericDataList[i].GetProperty(sortBy.Property)
		b := self.GenericDataList[j].GetProperty(sortBy.Property)
		// ignore sort completely if property name not found
		if a == nil || b == nil {
			break
		}
		cmp := a.Compare(b)
		if cmp == 0 { // values are the same. Just continue to next sortBy
			continue
		} else { // values different
			return (cmp == -1 && sortBy.Ascending) || (cmp == 1 && !sortBy.Ascending)
		}
	}
	return false
}

// Sort sorts the data inside as instructed by DataSelectQuery and returns itself to allow method chaining.
func (self *DataSelector) Sort() *DataSelector {
	sort.Sort(*self)
	return self
}

// Filter the data inside as instructed by DataSelectQuery and returns itself to allow method chaining.
func (self *DataSelector) Filter() *DataSelector {
	filteredList := []DataCell{}

	for _, c := range self.GenericDataList {
		matches := true
		for _, filterBy := range self.DataSelectQuery.FilterQuery.FilterByList {
			v := c.GetProperty(filterBy.Property)
			if v == nil {
				matches = false
				continue
			}
			if filterBy.Value.Compare(v) != 0 {
				matches = false
				continue
			}
		}
		if matches {
			filteredList = append(filteredList, c)
		}
	}

	self.GenericDataList = filteredList
	return self
}

// GetCumulativeMetrics downloads and aggregates metrics for data cells currently present in self.GenericDataList as instructed
// by MetricQuery and inserts resulting MetricPromises to self.CumulativeMetricsPromises.
func (self *DataSelector) GetCumulativeMetrics(heapsterClient *client.HeapsterClient) *DataSelector {
	metricNames := self.DataSelectQuery.MetricQuery.MetricNames
	if metricNames == nil {
		// Don't download any metrics
		return self
	}
	aggregations := self.DataSelectQuery.MetricQuery.Aggregations
	heapsterSelectors := make(metric.HeapsterSelectors, len(self.GenericDataList))
	// get all heapster queries
	for i, dataCell := range self.GenericDataList {
		// make sure data cells support metrics
		metricDataCell := dataCell.(MetricDataCell)

		// get its heapster selector
		heapsterSelector, err := metricDataCell.GetResourceSelector().GetHeapsterSelector(self.CachedResources.Pods)
		if err != nil {
			// Programming error. Notify immediately.
			panic(fmt.Sprintf(`Failed to create heapster selector for resource "%s". Error: %s`, metricDataCell.GetResourceSelector().ResourceType, err))
		}
		heapsterSelectors[i] = heapsterSelector
	}
	if aggregations == nil {
		aggregations = metric.OnlyDefaultAggregation
	}
	// panic if someone tries to download metrics without providing heapster client.
	if heapsterClient == nil {
		panic("Tried to download metrics without providing heapster client. Use dataselect.NoMetrics or provide heapster!")
	}
	self.CumulativeMetricsPromises = heapsterSelectors.DownloadAndAggregate(*heapsterClient, metricNames, aggregations)
	return self
}

// Paginates the data inside as instructed by DataSelectQuery and returns itself to allow method chaining.
func (self *DataSelector) Paginate() *DataSelector {
	pQuery := self.DataSelectQuery.PaginationQuery
	dataList := self.GenericDataList
	startIndex, endIndex := pQuery.GetPaginationSettings(len(dataList))

	// Return all items if provided settings do not meet requirements
	if !pQuery.IsValidPagination() {
		return self
	}
	// Return no items if requested page does not exist
	if !pQuery.IsPageAvailable(len(self.GenericDataList), startIndex) {
		self.GenericDataList = []DataCell{}
		return self
	}

	self.GenericDataList = dataList[startIndex:endIndex]
	return self
}

// GenericDataSelect takes a list of GenericDataCells and DataSelectQuery and returns selected data as instructed by dsQuery.
func GenericDataSelect(dataList []DataCell, dsQuery *DataSelectQuery) []DataCell {
	SelectableData := DataSelector{
		GenericDataList: dataList,
		DataSelectQuery: dsQuery,
	}
	return SelectableData.Sort().Paginate().GenericDataList
}

// GenericDataSelect takes a list of GenericDataCells and DataSelectQuery and returns selected data as instructed by dsQuery.
func GenericDataSelectWithMetrics(dataList []DataCell, dsQuery *DataSelectQuery,
	cachedResources *CachedResources, heapsterClient *client.HeapsterClient) ([]DataCell, metric.MetricPromises) {
	SelectableData := DataSelector{
		GenericDataList: dataList,
		DataSelectQuery: dsQuery,
		CachedResources: cachedResources,
	}
	// Pipeline is Filter -> Sort -> CollectMetrics -> Paginate
	processed := SelectableData.Sort().GetCumulativeMetrics(heapsterClient).Paginate()
	return processed.GenericDataList, processed.CumulativeMetricsPromises
}

func GenericDataSelectWithFilterAndMetrics(dataList []DataCell, dsQuery *DataSelectQuery,
	cachedResources *CachedResources, heapsterClient *client.HeapsterClient) ([]DataCell, metric.MetricPromises, int) {
	SelectableData := DataSelector{
		GenericDataList: dataList,
		DataSelectQuery: dsQuery,
		CachedResources: cachedResources,
	}
	// Pipeline is Filter -> Sort -> CollectMetrics -> Paginate
	filtered := SelectableData.Filter()
	filteredTotal := len(filtered.GenericDataList)
	processed := filtered.Sort().GetCumulativeMetrics(heapsterClient).Paginate()
	return processed.GenericDataList, processed.CumulativeMetricsPromises, filteredTotal

}
