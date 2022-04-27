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
	"reflect"
	"testing"
)

type PaginationTestCase struct {
	Info            string
	PaginationQuery *PaginationQuery
	ExpectedOrder   []int
}

type SortTestCase struct {
	Info          string
	SortQuery     *SortQuery
	ExpectedOrder []int
}

type TestDataCell struct {
	Name string
	Id   int
}

func (self TestDataCell) GetProperty(name PropertyName) ComparableValue {
	switch name {
	case NameProperty:
		return StdComparableString(self.Name)
	case CreationTimestampProperty:
		return StdComparableInt(self.Id)
	default:
		return nil
	}
}

func toCells(std []TestDataCell) []DataCell {
	cells := make([]DataCell, len(std))
	for i := range std {
		cells[i] = TestDataCell(std[i])
	}
	return cells
}

func fromCells(cells []DataCell) []TestDataCell {
	std := make([]TestDataCell, len(cells))
	for i := range std {
		std[i] = cells[i].(TestDataCell)
	}
	return std
}

func getDataCellList() []DataCell {
	return toCells([]TestDataCell{
		{"ab", 1},
		{"ab", 2},
		{"ab", 3},
		{"ac", 4},
		{"ac", 5},
		{"ad", 6},
		{"ba", 7},
		{"da", 8},
		{"ea", 9},
		{"aa", 10},
	})
}

func getOrder(dataList []TestDataCell) []int {
	idOrder := []int{}
	for _, e := range dataList {
		idOrder = append(idOrder, e.Id)
	}
	return idOrder
}

func TestSort(t *testing.T) {
	testCases := []SortTestCase{
		{
			"no sort - do not change the original order",
			NoSort,
			[]int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10},
		},
		{
			"ascending sort by 1 property - all items sorted by this property",
			NewSortQuery([]string{"a", "creationTimestamp"}),
			[]int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10},
		},
		{
			"descending sort by 1 property - all items sorted by this property",
			NewSortQuery([]string{"d", "creationTimestamp"}),
			[]int{10, 9, 8, 7, 6, 5, 4, 3, 2, 1},
		},
		{
			"sort by 2 properties - items should first be sorted by first property and later by second",
			NewSortQuery([]string{"a", "name", "d", "creationTimestamp"}),
			[]int{10, 3, 2, 1, 5, 4, 6, 7, 8, 9},
		},
		{
			"empty sort list - no sort",
			NewSortQuery([]string{}),
			[]int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10},
		},
		{
			"nil - no sort",
			NewSortQuery(nil),
			[]int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10},
		},
		// Invalid arguments to the NewSortQuery
		{
			"sort by few properties where at least one property name is invalid - no sort",
			NewSortQuery([]string{"a", "INVALID_PROPERTY", "d", "creationTimestamp"}),
			[]int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10},
		},
		{
			"sort by few properties where at least one order option is invalid - no sort",
			NewSortQuery([]string{"d", "name", "INVALID_ORDER", "creationTimestamp"}),
			[]int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10},
		},
		{
			"sort by few properties where one order tag is missing property - no sort",
			NewSortQuery([]string{""}),
			[]int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10},
		},
		{
			"sort by few properties where one order tag is missing property - no sort",
			NewSortQuery([]string{"d", "name", "a", "creationTimestamp", "a"}),
			[]int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10},
		},
	}
	for _, testCase := range testCases {
		selectableData := DataSelector{
			GenericDataList: getDataCellList(),
			DataSelectQuery: &DataSelectQuery{SortQuery: testCase.SortQuery},
		}
		sortedData := fromCells(selectableData.Sort().GenericDataList)
		order := getOrder(sortedData)
		if !reflect.DeepEqual(order, testCase.ExpectedOrder) {
			t.Errorf(`Sort: %s. Received invalid items for %+v. Got %v, expected %v.`,
				testCase.Info, testCase.SortQuery, order, testCase.ExpectedOrder)
		}
	}

}

func TestPagination(t *testing.T) {
	testCases := []PaginationTestCase{
		{
			"no pagination - all existing elements should be returned",
			NoPagination,
			[]int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10},
		},
		{
			"empty pagination - no elements should be returned",
			EmptyPagination,
			[]int{},
		},
		{
			"request one item from existing page - element should be returned",
			NewPaginationQuery(1, 5),
			[]int{6},
		},
		{
			"request one item from non existing page - no elements should be returned",
			NewPaginationQuery(1, 10),
			[]int{},
		},
		{
			"request 2 items from existing page - 2 elements should be returned",
			NewPaginationQuery(2, 1),
			[]int{3, 4},
		},
		{
			"request 3 items from partially existing page - last few existing should be returned",
			NewPaginationQuery(3, 3),
			[]int{10},
		},
		{
			"request more than total number of elements from page 1 - all existing elements should be returned",
			NewPaginationQuery(11, 0),
			[]int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10},
		},
		{
			"request 3 items from non existing page - no elements should be returned",
			NewPaginationQuery(3, 4),
			[]int{},
		},
		{
			"Invalid pagination - all elements should be returned",
			NewPaginationQuery(-1, 4),
			[]int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10},
		},
		{
			"Invalid pagination - all elements should be returned",
			NewPaginationQuery(1, -4),
			[]int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10},
		},
	}
	for _, testCase := range testCases {
		selectableData := DataSelector{
			GenericDataList: getDataCellList(),
			DataSelectQuery: &DataSelectQuery{PaginationQuery: testCase.PaginationQuery},
		}
		paginatedData := fromCells(selectableData.Paginate().GenericDataList)
		order := getOrder(paginatedData)
		if !reflect.DeepEqual(order, testCase.ExpectedOrder) {
			t.Errorf(`Pagination: %s. Received invalid items for %+v. Got %v, expected %v.`,
				testCase.Info, testCase.PaginationQuery, order, testCase.ExpectedOrder)
		}
	}

}
