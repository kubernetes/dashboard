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

import module from 'chrome/nav/module';
import {breadcrumbsConfig} from 'common/components/breadcrumbs/service';

describe('Nav service', () => {
  /** @type {!chrome/nav/service.NavService} */
  let navService;
  /** @type {!common/state/service.FutureStateService}*/
  let kdFutureStateService;

  beforeEach(() => {
    angular.mock.module(module.name);
    let fakeModule = angular.module('fakeModule', ['ui.router']);
    fakeModule.config(($stateProvider) => {
      $stateProvider.state('fakeState', {
        url: 'fakeStateUrl',
        template: '<ui-view>Foo</ui-view>',
      });
      $stateProvider.state('fakeNonActive', {
        url: 'fakeStateUrl',
        template: '<ui-view>Foo</ui-view>',
      });
      $stateProvider.state('fakeStateWithParent', {
        url: 'fakeStateUrl',
        template: '<ui-view>Foo</ui-view>',
        data: {
          [breadcrumbsConfig]: {
            parent: 'fakeState',
          },
        },
      });
    });
    angular.mock.module(fakeModule.name);
  });
  beforeEach(angular.mock.inject((kdNavService, _kdFutureStateService_) => {
    navService = kdNavService;
    kdFutureStateService = _kdFutureStateService_;
  }));

  it('should detect activity', () => {
    navService.registerState('fakeState');
    navService.registerState('fakeNonActive');

    expect(navService.isActive('fakeState')).toBe(false);
    expect(navService.isActive('fakeNonActive')).toBe(false);
    expect(navService.isActive('fakeStateWithParent')).toBe(false);

    kdFutureStateService.state = {name: 'fakeState'};

    expect(navService.isActive('fakeState')).toBe(true);
    expect(navService.isActive('fakeNonActive')).toBe(false);
    expect(navService.isActive('fakeStateWithParent')).toBe(false);

    kdFutureStateService.state = {name: 'fakeNonActive'};

    expect(navService.isActive('fakeState')).toBe(false);
    expect(navService.isActive('fakeNonActive')).toBe(true);
    expect(navService.isActive('fakeStateWithParent')).toBe(false);

    kdFutureStateService.state = {
      name: 'fakeStateWithParent',
      data: {
        [breadcrumbsConfig]: {
          parent: 'fakeState',
        },
      },
    };
    expect(navService.isActive('fakeState')).toBe(true);
    expect(navService.isActive('fakeNonActive')).toBe(false);
    expect(navService.isActive('fakeStateWithParent')).toBe(false);
  });
});
