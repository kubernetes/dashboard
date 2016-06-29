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
import errorHandlingModule from 'common/errorhandling/errorhandling_module';

describe('Resource card list pagination', () => {
  /** @type
   *  {!common/components/resourcecard/resourcecardlistpagination_component.ResourceCardListPaginationController}
   */
  let ctrl;
  /** @type
   *  {!common/components/resourcecard/resourcecardlistfooter_component.ResourceCardListFooterController}
   */
  let resourceCardListFooterCtrl;
  /** @type {string} */
  let paginationId = 'test-id';
  /** @type {!common/pagination/pagination_service.PaginationService} */
  let paginationService;

  beforeEach(() => {
    angular.mock.module(paginationModule.name);
    angular.mock.module(resourceCardModule.name);
    angular.mock.module(errorHandlingModule.name);

    angular.mock.inject(($componentController, _kdPaginationService_) => {
      resourceCardListFooterCtrl = {setListPagination: () => {}};
      paginationService = _kdPaginationService_;
      paginationService.registerInstance(paginationId);
      ctrl = $componentController('kdResourceCardListPagination', {}, {
        paginationId: paginationId,
        kdPaginationService: paginationService,
        resourceCardListFooterCtrl: resourceCardListFooterCtrl,
      });
    });
  });

  it('should set pagination controller on resource card list footer ctrl', () => {
    // given
    spyOn(resourceCardListFooterCtrl, 'setListPagination');

    // when
    ctrl.$onInit();

    // then
    expect(resourceCardListFooterCtrl.setListPagination).toHaveBeenCalledWith(ctrl);
  });

  it('should show pagination', () => {
    // given
    ctrl.list = {listMeta: {totalItems: 50}};

    // when
    let result = ctrl.shouldShowPagination();

    // then
    expect(result).toBeTruthy();
  });

  it('should hide pagination', () => {
    // given
    ctrl.list = {listMeta: {totalItems: 10}};

    // when
    let result = ctrl.shouldShowPagination();

    // then
    expect(result).toBeFalsy();
  });

  it('should update rows limit', () => {
    // given
    ctrl.rowsLimit = 100;
    spyOn(paginationService, 'setRowsLimit');

    // when
    ctrl.onRowsLimitUpdate();

    // then
    expect(paginationService.setRowsLimit).toHaveBeenCalledWith(100, paginationId);
  });
});
