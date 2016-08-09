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

package common

import (
	"time"
	"strings"
	"sort"
)

// GenericDataCell is the Interface of generic data cell.
// GenericDataSelect takes a list of these interfaces and performs selection operation.
// As long as the list is composed of GenericDataCells you can perform any data selection!
type GenericDataCell interface {
	// GetPropertyAtIndex returns the property of this data cell.
	// Value returned has to have Compare method which is required by Sort functionality of DataSelect.
	GetProperty(PropertyName) ComparableValue
}

type ComparableValue interface {
	// Compares self with other value. Returns 1 if other value is smaller, 0 if they are the same, -1 if other is larger.
	Compare(ComparableValue) int
}

// SelectableData contains all the required data to perform data selection.
// It implements sort.Interface so its sortable under sort.Sort
// You can use its Select method to get selected GenericDataCell list.
type SelectableData struct {
	// GenericDataList hold generic data cells that are being selected.
	GenericDataList []GenericDataCell
	// DataSelectQuery holds instructions for data select.
	DataSelectQuery *DataSelectQuery
}

// Here I am using a trick to be able to use built in sort function (sort.Sort) for sorting SelectableData
// The aim is to implement sort.Interface - it is to define 3 methods:
// Len, Swap and Less.

// Implementation of sort.Interface.

// Len returns the length of data inside SelectableData.
func (self SelectableData) Len() int {return len(self.GenericDataList)}

// Swap swaps 2 indices inside SelectableData.
func (self SelectableData) Swap(i, j int) {self.GenericDataList[i], self.GenericDataList[j] = self.GenericDataList[j], self.GenericDataList[i]}

// Less compares 2 indices inside SelectableData and returns true if first index is larger.
func (self SelectableData) Less(i, j int) bool {
	for _, sortBy := range (*self.DataSelectQuery.SortQuery).SortByList {
		a := self.GenericDataList[i].GetProperty(sortBy.Property)
		b := self.GenericDataList[j].GetProperty(sortBy.Property)
		// ignore sort completely if property name not found
		if a == nil || b == nil {
			break
		}
		cmp := a.Compare(b)
		if cmp == 0 { // values are the same. Just continue to next sortBy
			continue
		} else {  // values different
			return (cmp==-1 && sortBy.Ascending) || (cmp==1 && !sortBy.Ascending)
		}
	}
	return false
}

// Sort sorts the data inside as instructed by DataSelectQuery and returns itself to allow method chaining.
func (self *SelectableData) Sort() (*SelectableData) {
	sort.Sort(*self)
	return self
}

// Paginate paginetes the data inside as instructed by DataSelectQuery and returns itself to allow method chaining.
func (self *SelectableData) Paginate() (*SelectableData) {
	pQuery := self.DataSelectQuery.PaginationQuery
	dataList := self.GenericDataList
	startIndex, endIndex := pQuery.GetPaginationSettings(len(dataList))

	// Return all items if provided settings do not meet requirements
	if !pQuery.CanPaginate(len(self.GenericDataList), startIndex) {
		return self
	}
	self.GenericDataList = dataList[startIndex:endIndex]
	return self
}

// GenericDataSelect takes a list of GenericDataCells and DataSelectQuery and returns selected data as instructed by dsQuery.
func GenericDataSelect(dataList []GenericDataCell, dsQuery *DataSelectQuery) ([]GenericDataCell){
	SelectableData := SelectableData{
		GenericDataList: dataList,
		DataSelectQuery: dsQuery,
	}
	return SelectableData.Sort().Paginate().GenericDataList
}


// Int comparison functions. Similar to strings.Compare.
func intsCompare(a, b int) int {
	if a > b {
		return 1
	} else if a == b {
		return 0
	}
	return -1
}

func ints64Compare(a, b int64) int {
	if a > b {
		return 1
	} else if a == b {
		return 0
	}
	return -1
}
// ----------------------- Standard Comparable Types ------------------------
// These types specify how given value should be compared
// They all implement ComparableValueInterface
// You can convert basic types to these types to supprt auto sorting etc.
// If you cant find your type compare here you will have to implement it yourself :)

type StdComparableInt int

func (self StdComparableInt) Compare(otherV ComparableValue) int {
	other := otherV.(StdComparableInt)
	return intsCompare(int(self), int(other))
}


type StdComparableString string

func (self StdComparableString) Compare(otherV ComparableValue) int {
	other := otherV.(StdComparableString)
	return strings.Compare(string(self), string(other))
}

// StdComparableRFC3339Timestamp takes RFC3339 Timestamp strings and compares them as TIMES. In case of time parsing error compares values as strings.
type StdComparableRFC3339Timestamp string

func (self StdComparableRFC3339Timestamp) Compare(otherV ComparableValue) int {
	other := otherV.(StdComparableRFC3339Timestamp)
	// try to compare as timestamp (earlier = smaller)
	selfTime, err1 := time.Parse(time.RFC3339, string(self))
        otherTime, err2 := time.Parse(time.RFC3339, string(other))

	if err1!=nil || err2!=nil {
		// in case of timestamp parsing failure just compare as strings
		return strings.Compare(string(self), string(other))
	} else {
		return ints64Compare(selfTime.Unix(), otherTime.Unix())
	}
}

type StdComparableTime time.Time

func (self StdComparableTime) Compare(otherV ComparableValue) int {
	other := otherV.(StdComparableTime)
	return ints64Compare(time.Time(self).Unix(), time.Time(other).Unix())
}
