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
import dataSelectModule from 'common/dataselect/dataselect_module';
import errorHandlingModule from 'common/errorhandling/module';

describe('Resource card list pagination', () => {
  /** @type {!ResourceCardListPaginationController} */
  let ctrl;
  /** @type {!ResourceCardListController} */
  let resourceCardListCtrl;
  /** @type {string} */
  let selectId = 'test-id';
  /** @type {!DataSelectService} */
  let dataSelectService;
  /** @type {!angular.Scope} */
  let scope;
  /** @type {!angular.$httpBackend} */
  let httpBackend;
  /** @type {string} */
  let namespace = 'ns-1';
  /** @type {!ErrorDialog} */
  let errDialog;

  beforeEach(() => {
    angular.mock.module(dataSelectModule.name);
    angular.mock.module(resourceCardModule.name);
    angular.mock.module(errorHandlingModule.name);

    angular.mock.inject(
        ($componentController, _kdDataSelectService_, $rootScope, $resource, $httpBackend,
         errorDialog) => {
          dataSelectService = _kdDataSelectService_;
          dataSelectService.registerInstance(selectId);

          errDialog = errorDialog;
          httpBackend = $httpBackend;
          resourceCardListCtrl = $componentController(
              'kdResourceCardList', {$transclude: {}},
              {listResource: $resource('api/v1/pod/:namespace')});
          scope = $rootScope;
          ctrl = $componentController(
              'kdResourceCardListPagination', {
                $stateParams: {namespace: namespace},
                errorDialog: errDialog,
              },
              {
                selectId: selectId,
                kdDataSelectService: dataSelectService,
                resourceCardListCtrl: resourceCardListCtrl,
              });
        });
  });

  it('should show pagination', () => {
    // given
    resourceCardListCtrl.list = {listMeta: {totalItems: 50}};
    ctrl.selectId = 'test-id';

    // when
    let result = ctrl.shouldShowPagination();

    // then
    expect(result).toBeTruthy();
  });

  it('should hide pagination', () => {
    // given
    resourceCardListCtrl.list = {listMeta: {totalItems: 10}};
    ctrl.selectId = 'test-id';

    // when
    let result = ctrl.shouldShowPagination();

    // then
    expect(result).toBeFalsy();
  });

  it('should change page', () => {
    // given
    let response = {pods: ['pod-1']};
    let limit = 10;
    let page = 2;
    let queryString = `itemsPerPage=${limit}&page=${page}&sortBy=d,creationTimestamp`;
    httpBackend.expectGET(`api/v1/pod/${namespace}?${queryString}`).respond(200, response);

    // when
    ctrl.pageChanged(page);
    console.log(resourceCardListCtrl.list)
    scope.$digest();
    console.log(resourceCardListCtrl.list)
    // httpBackend.flush();


    // then
    expect(resourceCardListCtrl.list.pods).toEqual(response.pods);
  });

  it('should open error dialog on page change error', () => {
    // given
    spyOn(errDialog, 'open');
    let response = 'error';
    let limit = 10;
    let page = 2;
    let queryString = `itemsPerPage=${limit}&page=${page}&sortBy=d,creationTimestamp`;
    httpBackend.expectGET(`api/v1/pod/${namespace}?${queryString}`).respond(500, response);

    // when
    ctrl.pageChanged(page);
    httpBackend.flush();

    // then
    expect(errDialog.open).toHaveBeenCalledWith('Pagination error', response);
  });
});
