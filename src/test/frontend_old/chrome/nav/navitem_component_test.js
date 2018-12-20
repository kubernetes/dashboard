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

describe('Nav item component', () => {
  /** @type {!chrome/nav/component.NavItemController} */
  let ctrl;
  /** @type {!chrome/nav/service.NavService} */
  let kdNavService;

  beforeEach(() => {
    let fakeModule = angular.module('fakeModule', ['ui.router']);
    fakeModule.config(($stateProvider) => {
      $stateProvider.state('fakeState', {
        url: 'fakeStateUrl',
        template: '<ui-view>Foo</ui-view>',
      });
    });
    angular.mock.module(module.name);
    angular.mock.module(fakeModule.name);
    angular.mock.inject(($componentController, $rootScope, _kdNavService_) => {
      ctrl = $componentController('kdNavItem', {$scope: $rootScope}, {state: 'fakeState'});
      kdNavService = _kdNavService_;
    });
  });

  it('should register itself in nav service', () => {
    expect(kdNavService.states_).toEqual([]);

    ctrl.$onInit();

    expect(kdNavService.states_).toEqual(['fakeState']);
  });

  it('should render href', () => {
    // initial state assert
    expect(ctrl.state).toBe('fakeState');

    expect(ctrl.getHref()).toBe('#!fakeStateUrl');
  });

  it('should detect activity', () => {
    spyOn(kdNavService, 'isActive').and.returnValue(false);
    expect(ctrl.isActive()).toBe(false);

    kdNavService.isActive.and.returnValue(true);

    expect(ctrl.isActive()).toBe(true);
  });
});
