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

// Interface of the generic data cell.
// GenericDataSelect takes a list of these interfaces and performs selection operation.
// As long as the list is composed of GenericDataCells you can perform any data selection!
type GenericDataCell interface {
	// GetPropertyAtIndex returns the property of this data cell.
	// Value returned has to have Compare method which is required by Sort functionality of DataSelect.
	GetProperty(string) ComparableValue
}

type ComparableValue interface {
	Compare(ComparableValue) int
}

// Object containing all the required data to perform data selection.
// It implements sort.Interface so its sortable under sort.Sort
// You can use its Select method to get selected GenericDataCell list
type SelectableDataList struct {
	GenericDataList []GenericDataCell
	DataSelectQuery *DataSelectQuery
}

// here I am using a trick to be able to use built in sort function (sort.Sort) for sorting SelectableDataList
// The aim is to implement sort.Interface - it is to define 3 methods:
// Len, Swap and Less

// Implementation of sort.Interface
func (self SelectableDataList) Len() int {return len(self.GenericDataList)}

func (self SelectableDataList) Swap(i, j int) {self.GenericDataList[i], self.GenericDataList[j] = self.GenericDataList[j], self.GenericDataList[i]}

func (self SelectableDataList) Less(i, j int) bool {
	for _, sortBy := range (*self.DataSelectQuery.SortQuery).SortByList {
		a := self.GenericDataList[i].GetProperty(sortBy.Property)
		b := self.GenericDataList[j].GetProperty(sortBy.Property)
		cmp := a.Compare(b)
		if cmp == 0 { // values are the same. Just continue to next sortBy
			continue
		} else {  // values different
			return (cmp==-1 && sortBy.Ascending) || (cmp==1 && !sortBy.Ascending)
		}
	}
	return false
}

// Implementation of convenience Select method. Returns selected generic data cell list.
func (self SelectableDataList) Select() []GenericDataCell {
	// Simple pipeline:
	// First sort,
	sort.Sort(self)
	// later paginate and return
	return GenericPaginate(self.GenericDataList, self.DataSelectQuery.PaginationQuery)
}

// Selects slice of the data as required by PaginationQuery
func GenericPaginate(dataList []GenericDataCell, pQuery *PaginationQuery) ([]GenericDataCell) {
	startIndex, endIndex := pQuery.GetPaginationSettings(len(dataList))

	// Return all items if provided settings do not meet requirements
	if !pQuery.CanPaginate(len(dataList), startIndex) {
		return dataList
	}
	return dataList[startIndex:endIndex]
}

// Takes list of GenericDataCells and DataSelectQuery and returns selected data
func GenericDataSelect(dataList []GenericDataCell, dsQuery *DataSelectQuery) ([]GenericDataCell){
	selectableDataList := SelectableDataList{
		GenericDataList: dataList,
		DataSelectQuery: dsQuery,
	}
	return selectableDataList.Select()
}


// Int comparison functions. Similar to strings.Compare
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

// Takes RFC3339 Timestamp strings and compares them as TIMES. In case of time parsing error compares values as strings.
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
