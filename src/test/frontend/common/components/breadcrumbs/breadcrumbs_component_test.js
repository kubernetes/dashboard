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

import componentsModule from 'common/components/components_module';

describe('Breadcrumbs controller ', () => {
  /** @type {ui.router.$state} */
  let state;
  /** @type {angular.$interpolate} */
  let interpolate;
  /** @type {BreadcrumbsController} */
  let ctrl;
  /** @type {number} */
  let breadcrumbsLimit = 3;

  /**
   * Create simple mock object for state.
   *
   * @param {string} stateName
   * @param {string} stateLabel
   * @return {{name: string, kdBreadcrumbs: {label: string}}}
   */
  function getStateMock(stateName, stateLabel) {
    return {
      name: stateName,
      kdBreadcrumbs: {
        label: stateLabel,
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
      state.parent = getStateMock(`${stateNamePrefix}-${i+1}`);
      state = state.parent;
    }

    return parentState;
  }

  beforeEach(() => {
    angular.mock.module(componentsModule.name);

    angular.mock.inject(($componentController, $state, $interpolate) => {
      state = $state;
      interpolate = $interpolate;
      ctrl = $componentController(
          'kdBreadcrumbs', {
            $state: state,
            $interpolate: interpolate,
          },
          {
            limit: breadcrumbsLimit,
          });
    });
  });

  it('should call init breadcrumbs', () => {
    // given
    spyOn(ctrl, 'initBreadcrumbs');

    // when
    ctrl.$onInit();

    // then
    expect(ctrl.initBreadcrumbs).toHaveBeenCalled();
  });

  it('should initialize breadcrumbs', () => {
    // given
    state['$current'] = getStateMock('testState');

    // when
    let breadcrumbs = ctrl.initBreadcrumbs();

    // then
    expect(breadcrumbs.length).toEqual(1);
    expect(breadcrumbs[0].label).toEqual('testState');
  });

  it('should not exceed the breadcrumbs limit on initialize breadcrumbs', () => {
    // given
    let workingState = state['$current'] = getStateMock('testState');
    addStateParents(workingState, 3, 'parentState');

    // when
    let breadcrumbs = ctrl.initBreadcrumbs();

    //
    expect(breadcrumbs.length).toEqual(breadcrumbsLimit);
    for (let i = 0; i < breadcrumbs.length - 1; i++) {
      expect(breadcrumbs[i].label).toEqual(`parentState-${breadcrumbsLimit-(i+1)}`);
    }

    expect(breadcrumbs[breadcrumbsLimit - 1].label).toEqual('testState');
  });

  it('should return true when breadcrumb can be added', () => {
    // given
    let breadcrumbs = [];
    ctrl.limit = 1;

    // when
    let canBeAdded = ctrl.canAddBreadcrumb(breadcrumbs);

    // then
    expect(canBeAdded).toBeTruthy();
  });

  it('should return false when breadcrumb can not be added', () => {
    // given
    let breadcrumbs = ['b1', 'b2', 'b3'];
    ctrl.limit = 3;

    // when
    let canBeAdded = ctrl.canAddBreadcrumb(breadcrumbs);

    // then
    expect(canBeAdded).toBeFalsy();
  });

  it('should return parent state when breadcrumb parent is not defined', () => {
    // given
    state.parent = getStateMock('parentState');

    // when
    let parent = ctrl.getParentState(state);

    // expect
    expect(parent).toEqual(state.parent);
  });

  it('should return defined parent when breadcrumb parent is defined', () => {
    // given
    state.kdBreadcrumbs = {parent: 'parentState'};
    let parent = getStateMock('parentState');
    spyOn(state, 'get').and.returnValue(parent);

    // when
    let result = ctrl.getParentState(state);

    // expect
    expect(result).toEqual(parent);
  });

  it('should return breadcrumb object', () => {
    // given
    spyOn(state, 'href').and.returnValue('stateLink');
    let stateMock = getStateMock('testState');

    // when
    let breadcrumb = ctrl.getBreadcrumb(stateMock);

    // then
    expect(breadcrumb.label).toEqual(stateMock.name);
    expect(breadcrumb.stateLink).toEqual('stateLink');
  });

  it('should interpolated string as display name', () => {
    // given
    let stateContextVarName = 'stateLabel';
    let stateName = 'Test state';
    state.locals = {
      '@': {
        [stateContextVarName]: stateName,
      },
    };
    state.kdBreadcrumbs = {label: `{{${stateContextVarName}}}`};

    // when
    let result = ctrl.getDisplayName(state);

    // then
    expect(result).toEqual(stateName);
  });

  it('should return label when it is defined', () => {
    // given
    state.locals = {};
    state.kdBreadcrumbs = {label: 'Test state'};

    // when
    let result = ctrl.getDisplayName(state);

    // then
    expect(result).toEqual(state.kdBreadcrumbs.label);
  });

  it('should return state name when label is not defined', () => {
    // given
    state.name = 'testState';

    // when
    let result = ctrl.getDisplayName(state);

    // then
    expect(result).toEqual(state.name);
  });
});
