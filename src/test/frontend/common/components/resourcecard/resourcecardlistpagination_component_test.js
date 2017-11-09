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

import resourceCardModule from 'common/components/resourcecard/resourcecard_module';
import dataSelectModule from 'common/dataselect/module';
import errorHandlingModule from 'common/errorhandling/module';
import settingsServiceModule from 'common/settings/module';

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
  /** @type {!ErrorDialog} */
  let errDialog;
  /** @type {!angular.$q} **/
  let q;

  beforeEach(() => {
    angular.mock.module(dataSelectModule.name);
    angular.mock.module(resourceCardModule.name);
    angular.mock.module(errorHandlingModule.name);
    angular.mock.module(settingsServiceModule.name);

    angular.mock.inject(
        ($componentController, _kdDataSelectService_, $rootScope, $resource, $httpBackend,
         errorDialog, $q) => {
          dataSelectService = _kdDataSelectService_;
          dataSelectService.registerInstance(selectId);

          errDialog = errorDialog;
          q = $q;
          resourceCardListCtrl = $componentController(
              'kdResourceCardList', {$transclude: {}},
              {listResource: $resource('api/v1/pod/:namespace')});
          scope = $rootScope;
          ctrl = $componentController(
              'kdResourceCardListPagination', {
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
    let deferred = q.defer();
    let response = {pods: ['pod-1']};
    let page = 2;
    spyOn(dataSelectService, 'paginate').and.returnValue(deferred.promise);

    // when
    ctrl.pageChanged(page);
    deferred.resolve(response);
    scope.$digest();

    // then
    expect(resourceCardListCtrl.list.pods).toEqual(response.pods);
  });

  it('should open error dialog on page change error', () => {
    // given
    let deferred = q.defer();
    let response = {data: 'error'};
    let page = 2;
    spyOn(errDialog, 'open');
    spyOn(dataSelectService, 'paginate').and.returnValue(deferred.promise);

    // when
    ctrl.pageChanged(page);
    deferred.reject(response);
    scope.$digest();

    // then
    expect(errDialog.open).toHaveBeenCalledWith('Pagination error', response.data);
  });
});
