// Copyright 2017 The Kubernetes Dashboard Authors.
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

import authModule from 'common/auth/module';
import loginModule from 'login/module';
import LoginSpec from 'login/spec';
import {stateName as overviewState} from 'overview/state';

describe('Login component', () => {
  /** @type {!LoginController} */
  let ctrl;

  let state;

  let q;

  let authService;

  let scope;

  beforeEach(() => {
    angular.mock.module(authModule.name);
    angular.mock.module(loginModule.name);

    angular.mock.inject(($componentController, $state, $q, kdAuthService, $rootScope) => {
      q = $q;
      state = $state;
      authService = kdAuthService;
      scope = $rootScope;
      ctrl = $componentController('kdLogin', {$state: $state, kdAuthService: authService}, {});
    });
  });

  it('should update login spec', () => {
    // given
    ctrl.loginSpec = new LoginSpec();
    let spec = new LoginSpec({username: 'username'});

    // when
    ctrl.onUpdate(spec);

    // then
    expect(ctrl.loginSpec).toEqual(spec);
  });

  it('should redirect to overview after successful logging in', () => {
    // given
    ctrl.form = {$valid: true};
    let deferred = q.defer();
    spyOn(authService, 'login').and.returnValue(deferred.promise);
    spyOn(state, 'transitionTo');

    // when
    ctrl.login();
    deferred.resolve([]);
    scope.$digest();

    // then
    expect(state.transitionTo).toHaveBeenCalledWith(overviewState);
  });

  it('should show errors if there was an error during logging in', () => {
    // given
    ctrl.form = {$valid: true};
    let deferred = q.defer();
    spyOn(authService, 'login').and.returnValue(deferred.promise);
    spyOn(state, 'transitionTo');

    // when
    ctrl.login();
    deferred.resolve(['error']);
    scope.$digest();

    // then
    expect(ctrl.errors.length).toBe(1);
    expect(state.transitionTo).not.toHaveBeenCalled();
  });

  it('should skip login page', () => {
    // given
    spyOn(state, 'transitionTo');

    // when
    ctrl.skip();

    // then
    expect(state.transitionTo).toHaveBeenCalledWith(overviewState);
  });
});
