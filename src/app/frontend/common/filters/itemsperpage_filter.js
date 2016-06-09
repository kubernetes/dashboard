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

/**
 * Returns filter function that applies pagination on given collection by filtering out
 * redundant objects.
 *
 * @param {function(!Array<Object>, number, string): !Array<Object>} $delegate
 * @param {!../pagination/pagination_service.PaginationService} kdPaginationService
 * @return {function(!Array<Object>, number, string): !Array<Object>}
 * @ngInject
 */
export default function itemsPerPageFilter($delegate, kdPaginationService) {
  /** @type {function(!Array<Object>, number, string): !Array<Object>} */
  let sourceFilter = $delegate;

  /**
   * @param {!Array<Object>} collection
   * @param {number} itemsPerPage
   * @param {string} paginationId
   * @return {!Array<Object>}
   */
  let filterItems = function(collection, itemsPerPage, paginationId) {
    if (itemsPerPage === undefined) {
      if (!kdPaginationService.isRegistered(paginationId)) {
        kdPaginationService.registerInstance(paginationId);
      }

      return sourceFilter(collection, kdPaginationService.getRowsLimit(paginationId), paginationId);
    }

    return sourceFilter(collection, itemsPerPage, paginationId);
  };

  return filterItems;
}
