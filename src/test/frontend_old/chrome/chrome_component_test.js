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

import chromeModule from 'chrome/module';
import {actionbarViewName} from 'chrome/state';
import {fillContentConfig} from 'chrome/state';

describe('Chrome controller', () => {
  /** @type {ChromeController} */
  let ctrl;
  /** @type {!angular.Scope} */
  let scope;
  /** @type {!ui.router.$state} */
  let state;

  beforeEach(() => {
    angular.mock.module(chromeModule.name);
    angular.mock.inject(($componentController, $rootScope, $uiRouterGlobals, $state) => {
      ctrl = $componentController('kdChrome', {$state: $state});
      ctrl.$onInit();
      scope = $rootScope;
      state = $uiRouterGlobals;
    });
  });

  // TODO: rewrite test to work with new state transition hooks
  xit('should show and hide spinner on change events', angular.mock.inject(($timeout) => {
    // initial state assert
    expect(ctrl.loading).toBe(true);
    expect(ctrl.showLoadingSpinner).toBe(true);

    // when
    scope.$broadcast('$stateChangeSuccess');
    scope.$apply();

    // then
    expect(ctrl.loading).toBe(false);
    expect(ctrl.showLoadingSpinner).toBe(false);

    // when
    scope.$broadcast('$stateChangeStart');
    scope.$apply();

    // then
    expect(ctrl.loading).toBe(true);
    expect(ctrl.showLoadingSpinner).toBe(false);
    $timeout.flush();
    expect(ctrl.showLoadingSpinner).toBe(true);

    // when
    scope.$broadcast('$stateChangeError');
    scope.$apply();

    // then
    expect(ctrl.loading).toBe(false);
    expect(ctrl.showLoadingSpinner).toBe(false);
  }));

  it('should show and hide toolbar based on view state', () => {
    // Initially no action bar;
    expect(ctrl.isActionbarVisible()).toBe(false);

    // Even when loaded.
    ctrl.showLoadingSpinner = false;
    expect(ctrl.isActionbarVisible()).toBe(false);

    // No view loaded.
    state.current = null;
    expect(ctrl.isActionbarVisible()).toBe(false);

    // Dummy view loaded.
    state.current = {};
    expect(ctrl.isActionbarVisible()).toBe(false);

    // Simple view loaded.
    state.current.views = {};
    expect(ctrl.isActionbarVisible()).toBe(false);

    // View with action bar loaded.
    state.current.views[actionbarViewName] = {};
    expect(ctrl.isActionbarVisible()).toBe(true);

    // Transitioning to another view.
    ctrl.showLoadingSpinner = true;
    expect(ctrl.isActionbarVisible()).toBe(false);
  });

  it('should fill app content', () => {
    state.current = {data: {}};
    expect(ctrl.isFillContentView()).toBe(false);
    state.current.data[fillContentConfig] = 'true';
    expect(ctrl.isFillContentView()).toBe(false);
    state.current.data[fillContentConfig] = 1;
    expect(ctrl.isFillContentView()).toBe(false);
    state.current.data[fillContentConfig] = {};
    expect(ctrl.isFillContentView()).toBe(false);
    state.current.data[fillContentConfig] = false;
    expect(ctrl.isFillContentView()).toBe(false);
    state.current.data[fillContentConfig] = true;
    expect(ctrl.isFillContentView()).toBe(true);
  });
});
