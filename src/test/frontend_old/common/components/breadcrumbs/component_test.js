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

import {breadcrumbsConfig} from 'common/components/breadcrumbs/service';
import componentsModule from 'common/components/module';

describe('Breadcrumbs controller ', () => {
  /** @type {ui.router.$state} */
  let state;
  /** @type {angular.$interpolate} */
  let interpolate;
  /** @type {BreadcrumbsController} */
  let ctrl;
  /** @type {number} */
  let breadcrumbsLimit = 3;
  /** @type {!common/state/service.FutureStateService}*/
  let kdFutureStateService;

  /**
   * Create simple mock object for state.
   *
   * @param {string} stateName
   * @return {{name: string, kdBreadcrumbs: {label: string}}}
   */
  function getStateMock(stateName) {
    return {
      name: stateName,
      data: {
        [breadcrumbsConfig]: {
          label: stateName,
        },
      },
    };
  }

  /**
   * Adds specified number of mocked parents to given state with generated name based on given
   * state name prefix, i.e. `parent-1`, `parent-2`, `parent-3` for prefix equal to `parent` and
   * parents number equal to 3.
   *
   * @param {!ui.router.$state} state
   * @param {number} parentsNr
   * @param {string} stateNamePrefix
   * @return {!ui.router.$state}
   */
  function addStateParents(state, parentsNr, stateNamePrefix) {
    let parentState = state;
    for (let i = 0; i < parentsNr; i++) {
      let parent = getStateMock(`${stateNamePrefix}-${i + 1}`);
      state.data[breadcrumbsConfig].parent = parent;
      state = parent;
    }

    return parentState;
  }

  beforeEach(() => {
    angular.mock.module(componentsModule.name);

    angular.mock.inject(
        ($componentController, $state, $interpolate, _kdBreadcrumbsService_, $rootScope,
         _kdFutureStateService_) => {
          state = $state;
          interpolate = $interpolate;
          kdFutureStateService = _kdFutureStateService_;
          ctrl = $componentController(
              'kdBreadcrumbs', {
                $state: state,
                $interpolate: interpolate,
                kdBreadcrumbsService: _kdBreadcrumbsService_,
                $scope: $rootScope,
              },
              {
                limit: breadcrumbsLimit,
              });
        });
  });

  it('should call init breadcrumbs', () => {
    // given
    spyOn(ctrl, 'initBreadcrumbs_');

    // when
    ctrl.$onInit();

    // then
    expect(ctrl.initBreadcrumbs_).toHaveBeenCalled();
  });

  it('should initialize breadcrumbs', () => {
    // given
    kdFutureStateService.state = getStateMock('testState');

    // when
    ctrl.initBreadcrumbs_();
    let breadcrumbs = ctrl.breadcrumbs;

    // then
    expect(breadcrumbs.length).toEqual(1);
    expect(breadcrumbs[0].label).toEqual('testState');
  });

  it('should not exceed the breadcrumbs limit on initialize breadcrumbs', () => {
    // given
    let workingState = getStateMock('testState');
    kdFutureStateService.state = workingState;
    addStateParents(workingState, 3, 'parentState');

    // when
    ctrl.initBreadcrumbs_();
    let breadcrumbs = ctrl.breadcrumbs;

    // then
    expect(breadcrumbs.length).toEqual(breadcrumbsLimit);
    for (let i = 0; i < breadcrumbs.length - 1; i++) {
      expect(breadcrumbs[i].label).toEqual(`parentState-${breadcrumbsLimit - (i + 1)}`);
    }

    expect(breadcrumbs[breadcrumbsLimit - 1].label).toEqual('testState');
  });

  it('should return true when breadcrumb can be added', () => {
    // given
    let breadcrumbs = [];
    ctrl.limit = 1;

    // when
    let canBeAdded = ctrl.canAddBreadcrumb_(breadcrumbs);

    // then
    expect(canBeAdded).toBeTruthy();
  });

  it('should return false when breadcrumb can not be added', () => {
    // given
    let breadcrumbs = ['b1', 'b2', 'b3'];
    ctrl.limit = 3;

    // when
    let canBeAdded = ctrl.canAddBreadcrumb_(breadcrumbs);

    // then
    expect(canBeAdded).toBeFalsy();
  });

  it('should return breadcrumb object', () => {
    // given
    spyOn(state, 'href').and.returnValue('stateLink');
    let stateMock = getStateMock('testState');

    // when
    let breadcrumb = ctrl.getBreadcrumb_(stateMock);

    // then
    expect(breadcrumb.label).toEqual(stateMock.name);
    expect(breadcrumb.stateLink).toEqual('stateLink');
  });

  it('should show interpolated string as display name', () => {
    // given
    let stateName = 'Test state';
    state.data = {kdBreadcrumbs: {label: `{{$stateParams.foo}}`}};
    state.parent = {name: 'chrome'};

    // when
    let result = ctrl.getDisplayName_(state, {'foo': stateName});

    // then
    expect(result).toEqual(stateName);
  });

  it('should return label when it is defined', () => {
    // given
    state.locals = {};
    state.data = {kdBreadcrumbs: {label: 'Test state'}};
    state.parent = {name: ''};

    // when
    let result = ctrl.getDisplayName_(state);

    // then
    expect(result).toEqual(state.data.kdBreadcrumbs.label);
  });

  it('should return state name when label is not defined', () => {
    // given
    state.name = 'testState';

    // when
    let result = ctrl.getDisplayName_(state);

    // then
    expect(result).toEqual(state.name);
  });
});
