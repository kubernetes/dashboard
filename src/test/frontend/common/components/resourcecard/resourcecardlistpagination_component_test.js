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
import errorHandlingModule from 'common/errorhandling/errorhandling_module';
import paginationModule from 'common/pagination/pagination_module';

describe('Resource card list pagination', () => {
  /** @type
   *  {!common/components/resourcecard/resourcecardlistpagination_component.ResourceCardListPaginationController}
   */
  let ctrl;
  /** @type
   *  {!common/components/resourcecard/resourcecardlist_component.ResourceCardListController}
   */
  let resourceCardListCtrl;
  /** @type {string} */
  let paginationId = 'test-id';
  /** @type {!common/pagination/pagination_service.PaginationService} */
  let paginationService;
  /** @type {!angular.Scope} */
  let scope;
  /** @type {!angular.$httpBackend} */
  let httpBackend;
  /** @type {string} */
  let namespace = 'ns-1';
  /** @type {!common/errorhandling/errordialog_service.ErrorDialog} */
  let errDialog;

  beforeEach(() => {
    angular.mock.module(paginationModule.name);
    angular.mock.module(resourceCardModule.name);
    angular.mock.module(errorHandlingModule.name);

    angular.mock.inject(
        ($componentController, _kdPaginationService_, $rootScope, $resource, $httpBackend,
         errorDialog) => {
          paginationService = _kdPaginationService_;
          paginationService.registerInstance(paginationId);

          errDialog = errorDialog;
          httpBackend = $httpBackend;
          resourceCardListCtrl = $componentController('kdResourceCardList', {$transclude: {}});
          scope = $rootScope;
          ctrl = $componentController(
              'kdResourceCardListPagination', {
                $stateParams: {namespace: namespace},
                errorDialog: errDialog,
              },
              {
                paginationId: paginationId,
                kdPaginationService: paginationService,
                resourceCardListCtrl: resourceCardListCtrl,
                listResource: $resource('api/v1/pod/:namespace'),
              });
        });
  });

  it('should register listener', () => {
    // given
    spyOn(ctrl, 'registerStateChangeListener');

    // when
    ctrl.$onInit();

    // then
    expect(ctrl.registerStateChangeListener).toHaveBeenCalled();
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

  it('should reset rows limit', () => {
    // given
    spyOn(paginationService, 'resetRowsLimit');

    // when
    ctrl.$onInit();
    scope.$broadcast('$stateChangeStart');
    scope.$apply();

    // then
    expect(paginationService.resetRowsLimit).toHaveBeenCalled();
  });

  it('should change page', () => {
    // given
    let response = {pods: ['pod-1']};
    let limit = 10;
    let page = 2;
    let queryString = `itemsPerPage=${limit}&page=${page}`;
    paginationService.setRowsLimit(limit, paginationId);
    httpBackend.expectGET(`api/v1/pod/${namespace}?${queryString}`).respond(200, response);

    // when
    ctrl.pageChanged(page);
    httpBackend.flush();

    // then
    expect(ctrl.list.pods).toEqual(response.pods);
  });

  it('should open error dialog on page change error', () => {
    // given
    spyOn(errDialog, 'open');
    let response = 'error';
    let limit = 10;
    let page = 2;
    let queryString = `itemsPerPage=${limit}&page=${page}`;
    paginationService.setRowsLimit(limit, paginationId);
    httpBackend.expectGET(`api/v1/pod/${namespace}?${queryString}`).respond(500, response);

    // when
    ctrl.pageChanged(page);
    httpBackend.flush();

    // then
    expect(errDialog.open).toHaveBeenCalledWith('Pagination error', response);
  });

  it('should use object namespace first', () => {
    let limit = 10;
    let page = 2;
    let queryString = `itemsPerPage=${limit}&page=${page}`;
    paginationService.setRowsLimit(limit, paginationId);
    ctrl.stateParams_.objectNamespace = 'foo-ns';
    httpBackend.expectGET(`api/v1/pod/foo-ns?${queryString}`).respond(200, {});

    // when
    ctrl.pageChanged(page);
    httpBackend.flush();
  });
});
