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

import loginModule from 'login/module';

describe('Login options component', () => {
  /** @type {!LoginOptionsController} */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(loginModule.name);

    angular.mock.inject(($componentController) => {
      ctrl = $componentController('kdLoginOptions', {}, {});
    });
  });

  it('should select given option', () => {
    // given
    let tokenOption = {selected: false, title: 'Token'};
    let basicOption = {selected: false, title: 'Basic'};
    ctrl.options = [tokenOption, basicOption];

    // when
    ctrl.select(basicOption);

    // then
    expect(basicOption.selected).toBeTruthy();
    expect(ctrl.selectedOption).toBe(basicOption.title);
  });

  it('should add option to the list', () => {
    // given
    let tokenOption = {selected: false, title: 'Token'};

    // when
    ctrl.addOption(tokenOption);

    // then
    expect(ctrl.options.length).toBe(1);
  });
});
