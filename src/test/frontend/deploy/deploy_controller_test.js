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

import DeployController from 'deploy/deploy_controller';
import DeployFromSettingController from 'deploy/deployfromsettings_controller';
import deployModule from 'deploy/deploy_module';
import {stateName as zerostate} from 'zerostate/zerostate_state';

describe('Deploy controller', () => {
  /** @type {!DeployController} */
  let ctrl;
  /** @type {!DeployFromSettingsController} */
  let settingsCtrl;
  /** @type {!ui.router.$state} */
  let state;

  beforeEach(() => {
    angular.mock.module(deployModule.name);

    angular.mock.inject(($resource, $log, $state, $mdDialog, $q) => {
      state = $state;
      ctrl = new DeployController($resource, $log, state, $mdDialog, {namespaces: []});
      settingsCtrl = new DeployFromSettingController($log, $state, $resource, $q);
    });

    // prepare and mock
    ctrl.detail = settingsCtrl;
    ctrl.deployForm = {$invalid: false};
    settingsCtrl.deploy = () => { return settingsCtrl.q_.defer().promise; };
  });

  it('should return true when deploy in progress', () => {
    // when
    ctrl.deployBySelection();
    let result = ctrl.isDeployDisabled();

    // then
    expect(result).toBeTruthy();
  });

  it('should return false when deploy not in progress', () => {
    // when
    let result = ctrl.isDeployDisabled();

    // then
    expect(result).toBeFalsy();
  });

  it('should change state to zerostate view on cancel', () => {
    // given
    spyOn(state, 'go');

    // when
    ctrl.cancel();

    // then
    expect(state.go).toHaveBeenCalledWith(zerostate);
  });
});
