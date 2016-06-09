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

describe('Actionbar list buttons component', () => {
  /** @type {BreadcrumbsController} */
  let ctrl;
  /** @type {ui.router.$state} */
  let state;

  beforeEach(() => {
    angular.mock.module(componentsModule.name);
    let fakeModule = angular.module('fakeModule', []);
    fakeModule.config(($stateProvider) => {
      $stateProvider.state('fakeState', {
        url: 'fakeStateUrl',
        template: '<ui-view>Foo</ui-view>',
      });
    });
    angular.mock.module(fakeModule.name);

    angular.mock.inject(($componentController, $state) => {
      state = $state;
      ctrl = $componentController('kdActionbarListButtons', {
        $state: state,
      });
    });
  });

  it('should go to deploy pages', () => {
    // given
    spyOn(state, 'go');

    // when
    ctrl.deployApp();

    // then
    expect(state.go).toHaveBeenCalledWith('deployApp');

    // when
    ctrl.deployFile();

    // then
    expect(state.go).toHaveBeenCalledWith('deployFile');
  });
});
