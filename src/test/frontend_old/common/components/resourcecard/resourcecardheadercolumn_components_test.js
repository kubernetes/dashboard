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
import {SortableProperties} from 'common/dataselect/builder';
import dataSelectModule from 'common/dataselect/module';
import errorModule from 'common/errorhandling/module';
import settingsServiceModule from 'common/settings/module';

describe('Resource card header column', () => {
  /** @type {!ResourceCardHeaderColumnController} */
  let ctrl;
  /** @type {!DataSelectService} */
  let dataSelectService;
  /** @type {!angular.$q} */
  let q;
  /** @type {!md.$dialog}*/
  let errorDialog;
  /** @type {!angular.Scope} */
  let scope;

  beforeEach(() => {
    angular.mock.module(resourceCardModule.name);
    angular.mock.module(dataSelectModule.name);
    angular.mock.module(errorModule.name);
    angular.mock.module(settingsServiceModule.name);

    angular.mock.inject(
        ($componentController, _kdDataSelectService_, _errorDialog_, $q, $rootScope) => {
          scope = $rootScope;
          dataSelectService = _kdDataSelectService_;
          q = $q;
          errorDialog = _errorDialog_;
          let element = angular.element(`<div></div>`);
          let cardListCtrl = {
            setPending: () => {},
          };
          let headerColumnsCtrl = {
            addAndSizeHeaderColumn: () => {},
            reset: () => {},
          };
          ctrl = $componentController(
              'kdResourceCardHeaderColumn', {
                $element: element,
                kdDataSelectService: dataSelectService,
                errorDialog: errorDialog,
              },
              {
                resourceCardListCtrl: cardListCtrl,
                resourceCardHeaderColumnsCtrl: headerColumnsCtrl,
              });
        });
  });

  it('should init controller', () => {
    expect(ctrl).toBeDefined();
  });

  it('should disable sorting when sortable is true and list or list resource is not defined',
     () => {
       // given
       ctrl.sortable = true;

       // when
       ctrl.$onInit();

       // then
       expect(ctrl.sortable).toBeFalsy();
     });

  it('should init ascending sorting on age column by default', () => {
    // given
    ctrl.sortable = true;
    ctrl.resourceCardListCtrl.list = {};
    ctrl.resourceCardListCtrl.listResource = {};
    ctrl.sortId = SortableProperties.AGE;

    // when
    ctrl.$onInit();

    // then
    expect(ctrl.isAscending()).toBeTruthy();
  });

  it('should enable/disable sorting based on select id and sortable property', () => {
    // given
    let cases = [
      {selectId: 'test-id', sortable: true, expected: true},

      {selectId: '', sortable: true, expected: false},
      {selectId: 'test-id', sortable: false, expected: false},
      {selectId: undefined, sortable: true, expected: false},
    ];

    cases.forEach((c) => {
      // when
      ctrl.selectId = c.selectId;
      ctrl.sortable = c.sortable;

      // then
      expect(ctrl.shouldEnableSorting()).toEqual(c.expected);
    });
  });

  it('should indicate whether or not column is sorted in ascending order', () => {
    // given
    let cases = [
      {ascending: undefined, expected: false},
      {ascending: false, expected: false},

      {ascending: true, expected: true},
    ];

    cases.forEach((c) => {
      // when
      ctrl.ascending_ = c.ascending;

      // then
      expect(ctrl.isAscending()).toEqual(c.expected);
    });
  });

  it('should indicate whether or not column is sorted in descending order', () => {
    // given
    let cases = [
      {ascending: undefined, expected: false},
      {ascending: true, expected: false},

      {ascending: false, expected: true},
    ];

    cases.forEach((c) => {
      // when
      ctrl.ascending_ = c.ascending;

      // then
      expect(ctrl.isDescending()).toEqual(c.expected);
    });
  });

  it('should indicate whether or not column is sorted', () => {
    // given
    let cases = [
      {ascending: undefined, expected: false},

      {ascending: true, expected: true},
      {ascending: false, expected: true},
    ];

    cases.forEach((c) => {
      // when
      ctrl.ascending_ = c.ascending;

      // then
      expect(ctrl.isSorted()).toEqual(c.expected);
    });
  });

  it('should reset column sorting to default state', () => {
    // given
    ctrl.ascending_ = true;

    // when
    ctrl.reset();

    // then
    expect(ctrl.isSorted()).toBeFalsy();
  });

  it('should sort column', () => {
    let deferred = q.defer();
    spyOn(dataSelectService, 'sort').and.returnValue(deferred.promise);

    ctrl.sort();
    expect(ctrl.resourceCardListCtrl.list).toBeUndefined();

    deferred.resolve({});
    scope.$digest();

    expect(ctrl.resourceCardListCtrl.list).toBeDefined();
    expect(ctrl.isSorted()).toBeTruthy();
    expect(ctrl.isAscending()).toBeTruthy();

    // should sort in opposite order
    ctrl.sort();
    deferred.resolve({});
    scope.$digest();

    expect(ctrl.isDescending()).toBeTruthy();
  });

  it('should throw an error during sorting', () => {
    let deferred = q.defer();
    let error = {data: 'error'};
    spyOn(dataSelectService, 'sort').and.returnValue(deferred.promise);
    spyOn(errorDialog, 'open');

    ctrl.sort();
    expect(ctrl.resourceCardListCtrl.list).toBeUndefined();

    deferred.reject(error);
    scope.$digest();

    expect(errorDialog.open).toHaveBeenCalledTimes(1);
  });
});
