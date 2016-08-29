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

import module from 'chrome/nav/module';
import {breadcrumbsConfig} from 'common/components/breadcrumbs/breadcrumbs_service';

describe('Nav item component', () => {
  /** @type {!chrome/nav/navitem_component.NavItemController} */
  let ctrl;
  /** @type {!common/state/futurestate_service.FutureStateService}*/
  let kdFutureStateService;

  beforeEach(() => {
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
    angular.mock.module(module.name);
    angular.mock.module(fakeModule.name);
    angular.mock.inject(($componentController, $rootScope, _kdFutureStateService_) => {
      ctrl = $componentController('kdNavItem', {$scope: $rootScope}, {state: 'fakeState'});
      kdFutureStateService = _kdFutureStateService_;
    });
  });

  it('should render href', () => {
    // initial state assert
    expect(ctrl.state).toBe('fakeState');

    expect(ctrl.getHref()).toBe('#fakeStateUrl');
  });

  it('should detect activity', angular.mock.inject(($state, $rootScope) => {
    expect(ctrl.isActive()).toBe(false);

    kdFutureStateService.state = {name: 'fakeState'};

    expect(ctrl.isActive()).toBe(true);

    kdFutureStateService.state = {name: 'fakeNonActive'};
    expect(ctrl.isActive()).toBe(false);

    $state.go('fakeStateWithParent');
    $rootScope.$digest();
    expect(ctrl.isActive()).toBe(true);
  }));
});
