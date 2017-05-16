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
import dataSelectModule from 'common/dataselect/module';
import errorHandlingModule from 'common/errorhandling/module';

describe('Resource card list filtering', () => {
  /** @type {!ResourceCardListFilterController} */
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
              'kdResourceCardListFilter', {
                errorDialog: errDialog,
              },
              {
                selectId: selectId,
                kdDataSelectService: dataSelectService,
                resourceCardListCtrl: resourceCardListCtrl,
              });
        });
  });

  it('should enable search', () => {
    // given
    ctrl.selectId_ = 'mock';
    ctrl.resourceCardListCtrl = {list: 'mock', listResource: 'mock'};

    // when
    let result = ctrl.shouldEnable();

    // then
    expect(result).toBeTruthy();
  });

  it('should disable search', () => {
    // when
    let result = ctrl.shouldEnable();

    // then
    expect(result).toBeFalsy();
  });

  it('should filter pods', () => {
    // given
    let deferred = q.defer();
    let response = {pods: ['pod-1']};
    ctrl.inputText = 'p';
    spyOn(dataSelectService, 'filter').and.returnValue(deferred.promise);

    // when
    ctrl.onTextUpdate();
    deferred.resolve(response);
    scope.$digest();

    // then
    expect(resourceCardListCtrl.list.pods).toEqual(response.pods);
  });

  it('should open error dialog on filter error', () => {
    // given
    let deferred = q.defer();
    let response = {data: 'error'};
    spyOn(errDialog, 'open');
    spyOn(dataSelectService, 'filter').and.returnValue(deferred.promise);

    // when
    ctrl.onTextUpdate();
    deferred.reject(response);
    scope.$digest();

    // then
    expect(errDialog.open).toHaveBeenCalledWith('Filtering error', response.data);
  });

  it('should show search', () => {
    // given
    ctrl.hidden_ = false;

    // when
    let result = ctrl.isSearchVisible();

    // then
    expect(result).toBeTruthy();
  });

  it('should hide search', () => {
    // given
    ctrl.hidden_ = true;

    // when
    let result = ctrl.isSearchVisible();

    // then
    expect(result).toBeFalsy();
  });

  it('should switch search visibility', () => {
    // given
    ctrl.hidden_ = false;

    // when
    ctrl.switchSearchVisibility();

    // then
    expect(ctrl.isSearchVisible()).toBeFalsy();
  });

  it('should clear search box and hide search', () => {
    // given
    let deferred = q.defer();
    ctrl.hidden_ = false;
    ctrl.inputText = 'test';
    spyOn(dataSelectService, 'filter').and.returnValue(deferred.promise);

    // when
    ctrl.clearInput();

    // then
    expect(ctrl.inputText).toEqual('');
    expect(dataSelectService.filter).toHaveBeenCalled();
    expect(ctrl.isSearchVisible()).toBeFalsy();
  });
});
