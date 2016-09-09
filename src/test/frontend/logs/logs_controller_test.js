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

import {LogsController} from 'logs/logs_controller';
import LogsModule from 'logs/logs_module';

describe('Logs controller', () => {

  /** @type {string} */
  const logsTextColorClassName = 'kd-logs-text-color-invert';

  /** @type {!LogsController} */
  let ctrl;

  /** @type {!backendApi.PodContainers} */
  const podContainers = {containers: ['con1']};

  let podLogs = {
    logs: [],
  };

  beforeEach(() => {
    angular.mock.module(LogsModule.name);

    angular.mock.inject(($controller) => {
      ctrl = $controller(LogsController, {podLogs: podLogs, podContainers: podContainers});
    });
  });

  it('should instantiate the controller properly', () => { expect(ctrl).not.toBeUndefined(); });

  it('should return style class for logs content', () => {
    // expect
    expect(ctrl.getStyleClass()).toEqual(`${logsTextColorClassName}`);
  });
});
