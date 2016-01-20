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
import {stateName as replicasets} from 'replicasetlist/replicasetlist_state';

describe('Deploy controller', () => {
  /** @type {!DeployController} */
  let ctrl;
  /** @type {!DeployFromSettingsController} */
  let settingsCtrl;
  /** @type {!ui.router.$state} */
  let state;
  /** @type {!angular.Service} */
  let i18nServiceMock;

  beforeEach(() => {
    angular.mock.module(deployModule.name);

    angular.mock.inject(($controller, $state, $q) => {
      state = $state;

      i18nServiceMock = {
        deploy: {userhelp: {appName: () => { return {content: 'App name help message mock'}; }}},
      };

      settingsCtrl = $controller(
          DeployFromSettingController, {i18n: i18nServiceMock},
          {namespaces: [], deploy: () => $q.defer().promise});
      ctrl = $controller(
          DeployController, {namespaces: []}, {detail: settingsCtrl, deployForm: {$valid: true}});
    });
  });

  it('should return true when deploy in progress', () => {
    // when
    ctrl.deployBySelection();
    let result = ctrl.isDeployDisabled();

    // then
    expect(result).toBe(true);
  });

  it('should return false when deploy not in progress', () => {
    // when
    let result = ctrl.isDeployDisabled();

    // then
    expect(result).toBe(false);
  });

  it('should change state to replica set list view on cancel', () => {
    // given
    spyOn(state, 'go');

    // when
    ctrl.cancel();

    // then
    expect(state.go).toHaveBeenCalledWith(replicasets);
  });
});
