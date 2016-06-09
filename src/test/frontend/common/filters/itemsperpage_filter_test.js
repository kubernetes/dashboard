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

import filtersModule from 'common/filters/filters_module';
import paginationModule from 'common/pagination/pagination_module';
import {DEFAULT_ROWS_LIMIT} from 'common/pagination/pagination_service';

describe('Items per page filter', () => {
  /** @type {function(!Array<Object>, number, string): !Array<Object>} */
  let itemsPerPageFilter;
  /** @type {!Object} - service related to third party pagination module */
  let paginationService;

  beforeEach(() => {
    angular.mock.module(paginationModule.name);
    angular.mock.module('angularUtils.directives.dirPagination');
    angular.mock.module(filtersModule.name);

    angular.mock.inject((_itemsPerPageFilter_, _paginationService_) => {
      itemsPerPageFilter = _itemsPerPageFilter_;
      paginationService = _paginationService_;
    });
  });

  it('should format memory', () => {
    // given
    let paginationId = 'test-id';
    paginationService.registerInstance(paginationId);

    // then
    expect(itemsPerPageFilter(new Array(20), 5, paginationId).length).toEqual(5);
    expect(itemsPerPageFilter(new Array(100), 0, paginationId).length).toEqual(100);
    expect(itemsPerPageFilter(new Array(DEFAULT_ROWS_LIMIT + 10), undefined, paginationId).length)
        .toEqual(DEFAULT_ROWS_LIMIT);
    expect(itemsPerPageFilter(new Array(DEFAULT_ROWS_LIMIT + 1), undefined, paginationId).length)
        .toEqual(DEFAULT_ROWS_LIMIT);
    expect(itemsPerPageFilter(new Array(DEFAULT_ROWS_LIMIT), undefined, paginationId).length)
        .toEqual(DEFAULT_ROWS_LIMIT);
    expect(itemsPerPageFilter(new Array(DEFAULT_ROWS_LIMIT - 1), undefined, paginationId).length)
        .toEqual(DEFAULT_ROWS_LIMIT - 1);
  });
});
