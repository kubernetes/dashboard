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

func TestNewPaginationQuery(t *testing.T) {
	cases := []struct {
		itemsPerPage, page int
		expected           *PaginationQuery
	}{
		{0, 0, &PaginationQuery{0, 0}},
		{1, 10, &PaginationQuery{1, 10}},
	}

	for _, c := range cases {
		actual := NewPaginationQuery(c.itemsPerPage, c.page)
		if !reflect.DeepEqual(actual, c.expected) {
			t.Errorf("NewPaginationQuery(%+v, %+v) == %+v, expected %+v",
				c.itemsPerPage, c.page, actual, c.expected)
		}
	}
}

func TestIsValidPagination(t *testing.T) {
	cases := []struct {
		pQuery   *PaginationQuery
		expected bool
	}{
		{&PaginationQuery{0, 0}, true},
		{&PaginationQuery{5, 0}, true},
		{&PaginationQuery{10, 1}, true},
		{&PaginationQuery{0, 2}, true},
		{&PaginationQuery{10, -1}, false},
		{&PaginationQuery{-1, 0}, false},
		{&PaginationQuery{-1, -1}, false},
	}

	for _, c := range cases {
		actual := c.pQuery.IsValidPagination()
		if actual != c.expected {
			t.Errorf("CanPaginate() == %+v, expected %+v", actual, c.expected)
		}
	}
}

func TestGetPaginationSettings(t *testing.T) {
	cases := []struct {
		pQuery               *PaginationQuery
		itemsCount           int
		startIndex, endIndex int
	}{
		{&PaginationQuery{0, 0}, 10, 0, 0},
		{&PaginationQuery{10, 1}, 10, 10, 10},
		{&PaginationQuery{10, 0}, 10, 0, 10},
	}

	for _, c := range cases {
		actualStartIdx, actualEndIdx := c.pQuery.GetPaginationSettings(c.itemsCount)
		if actualStartIdx != c.startIndex || actualEndIdx != c.endIndex {
			t.Errorf("GetPaginationSettings(%+v) == %+v, %+v, expected %+v, %+v",
				c.itemsCount, actualStartIdx, actualEndIdx, c.startIndex, c.endIndex)
		}
	}
}
