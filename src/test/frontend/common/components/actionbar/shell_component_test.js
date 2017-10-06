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

import componentsModule from 'common/components/module';

describe('Actionbar shell button component', () => {
  /** @type {ActionbarShellButtonController} */
  let ctrl;
  /** @type {ui.router.$state} */
  let state;
  /** @type {angular.$window} */
  let window;

  beforeEach(() => {
    angular.mock.module(componentsModule.name);

    angular.mock.inject(($componentController, $state, $window) => {
      state = $state;
      window = $window;
      ctrl = $componentController('kdActionbarShellButton', {
        $state: state,
        $window: window,
      });
    });
  });

  it('should open shell page', () => {
    // given
    spyOn(state, 'href').and.callThrough();
    spyOn(window, 'open');

    // when
    ctrl.openShell();

    // then
    expect(state.href).toHaveBeenCalled();
    expect(window.open).toHaveBeenCalled();
  });
});
