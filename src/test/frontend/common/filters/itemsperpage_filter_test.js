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

import {ItemsPerPage} from 'common/dataselect/builder';
import dataSelectModule from 'common/dataselect/module';
import filtersModule from 'common/filters/module';

describe('Items per page filter', () => {
  /** @type {function(!Array<Object>, number, string): !Array<Object>} */
  let itemsPerPageFilter;
  /** @type {!DataSelectService} - service related to data select module */
  let dataSelectService;
  /** @type {!Object} */
  let paginationService;


  beforeEach(() => {
    angular.mock.module(dataSelectModule.name);
    angular.mock.module('angularUtils.directives.dirPagination');
    angular.mock.module(filtersModule.name);

    angular.mock.inject((_itemsPerPageFilter_, _kdDataSelectService_, _paginationService_) => {
      itemsPerPageFilter = _itemsPerPageFilter_;
      dataSelectService = _kdDataSelectService_;
      paginationService = _paginationService_;
    });
  });

  it('should format memory', () => {
    // given
    let dataSelectId = 'test-id';
    paginationService.registerInstance(dataSelectId);
    dataSelectService.registerInstance(dataSelectId);

    // then
    expect(itemsPerPageFilter(new Array(20), 5, dataSelectId).length).toEqual(5);
    expect(itemsPerPageFilter(new Array(100), 0, dataSelectId).length).toEqual(100);
    expect(itemsPerPageFilter(new Array(ItemsPerPage + 10), undefined, dataSelectId).length)
        .toEqual(ItemsPerPage);
    expect(itemsPerPageFilter(new Array(ItemsPerPage + 1), undefined, dataSelectId).length)
        .toEqual(ItemsPerPage);
    expect(itemsPerPageFilter(new Array(ItemsPerPage), undefined, dataSelectId).length)
        .toEqual(ItemsPerPage);
    expect(itemsPerPageFilter(new Array(ItemsPerPage - 1), undefined, dataSelectId).length)
        .toEqual(ItemsPerPage - 1);
  });
});
