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

describe('Basic login component', () => {
  /** @type {!BasicLoginController} */
  let ctrl;
  /** @type {!LoginOptionsController} */
  let optionsCtrl;

  beforeEach(() => {
    angular.mock.module(loginModule.name);

    angular.mock.inject(($componentController) => {
      optionsCtrl = $componentController('kdLoginOptions', {}, {});
      ctrl = $componentController(
          'kdBasicLogin', {}, {loginOptionsCtrl: optionsCtrl, onUpdate: () => {}});
    });
  });

  it('should init controller', () => {
    // given
    spyOn(optionsCtrl, 'addOption');

    // when
    ctrl.$onInit();

    // then
    expect(ctrl).toBeDefined();
    expect(optionsCtrl.addOption).toHaveBeenCalled();
  });

  it('should clear input', () => {
    // given
    spyOn(ctrl, 'onUpdate');
    ctrl.username = 'test-user';
    ctrl.password = 'test-password';

    // when
    ctrl.clear();

    // then
    expect(ctrl.username).toEqual('');
    expect(ctrl.password).toEqual('');
    expect(ctrl.onUpdate).toHaveBeenCalled();
  });
});
