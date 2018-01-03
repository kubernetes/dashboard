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
import {stateName as defaultStateName} from 'overview/state';

describe('Breadcrumbs service ', () => {
  /** @type {ui.router.$state} */
  let state;
  /** @type {BreadcrumbsController} */
  let breadcrumbsService;

  /**
   * Create simple mock object for state.
   *
   * @param {string} stateName
   * @param {string} stateLabel
   * @param {string} stateParent
   * @return {{name: string, kdBreadcrumbs: {label: string}}}
   */
  function getStateMock(stateName, stateLabel, stateParent) {
    return {
      name: stateName,
      data: {
        [breadcrumbsConfig]: {
          label: stateLabel,
          parent: stateParent,
        },
      },
    };
  }

  beforeEach(() => {
    angular.mock.module(componentsModule.name);

    angular.mock.inject((_kdBreadcrumbsService_, $state) => {
      state = $state;
      breadcrumbsService = _kdBreadcrumbsService_;
    });
  });

  it('should not return parent state when breadcrumb parent is not defined', () => {
    // given
    state.parent = getStateMock('parentState');

    // when
    let parent = breadcrumbsService.getParentState(state);

    // expect
    expect(parent).toBeNull();
  });

  it('should return defined parent when breadcrumb parent is defined', () => {
    // given
    state.data = {kdBreadcrumbs: {parent: 'parentState'}};
    let parent = getStateMock('parentState');
    spyOn(state, 'get').and.returnValue(parent);

    // when
    let result = breadcrumbsService.getParentState(state);

    // expect
    expect(result).toEqual(parent);
  });

  it('should return breadcrumb config when it is defined', () => {
    // given
    let stateMock = getStateMock('testState');

    // when
    let result = breadcrumbsService.getBreadcrumbConfig(stateMock);

    // then
    expect(result).toBeDefined();
  });

  it('should return undefined when breadcrumb config is not defined', () => {
    // when
    let result = breadcrumbsService.getBreadcrumbConfig(state);

    // then
    expect(result).toBeUndefined();
  });

  it('should return default state name when parent not defined', () => {
    // when
    let result = breadcrumbsService.getParentStateName(state);

    // then
    expect(result).toEqual(defaultStateName);
  });

  it('should return parent state name when it is defined', () => {
    // given
    let stateMock = getStateMock('testState', 'testLabel', 'testParent');

    // when
    let result = breadcrumbsService.getParentStateName(stateMock);

    // then
    expect(result).toEqual('testParent');
  });
});
