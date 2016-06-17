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

import resourceCardModule from 'common/components/resourcecard/resourcecard_module';
import paginationModule from 'common/pagination/pagination_module';
import {DEFAULT_ROWS_LIMIT} from 'common/pagination/pagination_service';

describe('Resource card list footer', () => {
  /** @type
   *  {!common/components/resourcecard/resourcecardlistfooter_component.ResourceCardListFooterController}
   */
  let ctrl;
  /** @type {boolean} */
  let isSlotFilledResult;

  beforeEach(() => {
    angular.mock.module(paginationModule.name);
    angular.mock.module(resourceCardModule.name);

    angular.mock.inject(($componentController, _kdPaginationService_) => {
      ctrl = $componentController(
          'kdResourceCardListFooter', {
            kdPaginationService: _kdPaginationService_,
            $transclude: {isSlotFilled: () => { return isSlotFilledResult; }},
          },
          {});
    });
  });

  it('should set list pagination controller', () => {
    // given
    let listPaginationCtrl = {};

    // when
    ctrl.setListPagination(listPaginationCtrl);

    // then
    expect(ctrl.listPagination_).toEqual(listPaginationCtrl);
  });

  it('should throw an error when list pagination controller is already set', () => {
    // given
    let listPaginationCtrl = {};

    // when
    ctrl.setListPagination(listPaginationCtrl);

    // then
    expect(() => {
      ctrl.setListPagination(listPaginationCtrl);
    }).toThrow(new Error('List pagination controller already set.'));
  });

  it('should show pagination', () => {
    // given
    let listPaginationCtrl = {totalItems: DEFAULT_ROWS_LIMIT + 1};

    // when
    ctrl.setListPagination(listPaginationCtrl);
    let result = ctrl.shouldShowPagination_();

    // then
    expect(result).toBeTruthy();
  });

  it('should hide pagination', () => {
    // given
    let listPaginationCtrl = {totalItems: DEFAULT_ROWS_LIMIT};

    // when
    ctrl.setListPagination(listPaginationCtrl);
    let result = ctrl.shouldShowPagination_();

    // then
    expect(result).toBeFalsy();
  });

  it('should show/hide footer when needed', () => {
    // given
    let cases = [
      [true, {totalItems: 100}, true],
      [true, {totalItems: 10}, true],
      [false, {totalItems: 100}, true],
      [false, {totalItems: 10}, false],
    ];

    cases.forEach((data) => {
      // when
      isSlotFilledResult = data[0];
      ctrl.listPagination_ = data[1];
      let expected = data[2];

      // then
      expect(ctrl.shouldShowFooter()).toBe(expected);
    });
  });
});
