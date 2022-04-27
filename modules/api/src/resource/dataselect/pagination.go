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

// By default backend pagination will not be applied.
var NoPagination = NewPaginationQuery(-1, -1)

// No items will be returned
var EmptyPagination = NewPaginationQuery(0, 0)

// Returns 10 items from page 1
var DefaultPagination = NewPaginationQuery(10, 0)

// PaginationQuery structure represents pagination settings
type PaginationQuery struct {
	// How many items per page should be returned
	ItemsPerPage int
	// Number of page that should be returned when pagination is applied to the list
	Page int
}

// NewPaginationQuery return pagination query structure based on given parameters
func NewPaginationQuery(itemsPerPage, page int) *PaginationQuery {
	return &PaginationQuery{itemsPerPage, page}
}

// IsValidPagination returns true if pagination has non negative parameters
func (p *PaginationQuery) IsValidPagination() bool {
	return p.ItemsPerPage >= 0 && p.Page >= 0
}

// IsPageAvailable returns true if at least one element can be placed on page. False otherwise
func (p *PaginationQuery) IsPageAvailable(itemsCount, startingIndex int) bool {
	return itemsCount > startingIndex && p.ItemsPerPage > 0
}

// GetPaginationSettings based on number of items and pagination query parameters returns start
// and end index that can be used to return paginated list of items.
func (p *PaginationQuery) GetPaginationSettings(itemsCount int) (startIndex int, endIndex int) {
	startIndex = p.ItemsPerPage * p.Page
	endIndex = startIndex + p.ItemsPerPage

	if endIndex > itemsCount {
		endIndex = itemsCount
	}

	return startIndex, endIndex
}
