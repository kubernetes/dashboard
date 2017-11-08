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

import dataSelectModule from 'common/dataselect/module';
import filtersModule from 'common/filters/module';
import settingsServiceModule from 'common/settings/module';

describe('Items per page filter', () => {
  /** @type {function(!Array<Object>, number, string): !Array<Object>} */
  let itemsPerPageFilter;
  /** @type {!DataSelectService} - service related to data select module */
  let dataSelectService;
  /** @type {!Object} */
  let paginationService;
  /** @type {number} */
  let itemsPerPage = 10;

  beforeEach(() => {
    angular.mock.module(dataSelectModule.name);
    angular.mock.module('angularUtils.directives.dirPagination');
    angular.mock.module(filtersModule.name);
    angular.mock.module(settingsServiceModule.name);

    angular.mock.inject(
        (_itemsPerPageFilter_, _kdDataSelectService_, _paginationService_, _kdSettingsService_) => {
          itemsPerPageFilter = _itemsPerPageFilter_;
          dataSelectService = _kdDataSelectService_;
          paginationService = _paginationService_;
          itemsPerPage = _kdSettingsService_.getItemsPerPage();
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
    expect(itemsPerPageFilter(new Array(itemsPerPage + 10), undefined, dataSelectId).length)
        .toEqual(itemsPerPage);
    expect(itemsPerPageFilter(new Array(itemsPerPage + 1), undefined, dataSelectId).length)
        .toEqual(itemsPerPage);
    expect(itemsPerPageFilter(new Array(itemsPerPage), undefined, dataSelectId).length)
        .toEqual(itemsPerPage);
    expect(itemsPerPageFilter(new Array(itemsPerPage - 1), undefined, dataSelectId).length)
        .toEqual(itemsPerPage - 1);
  });
});
