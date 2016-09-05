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

import LogsModule from 'logs/logs_module';
import {StateParams} from 'logs/logs_state';
import LogsToolbarController from 'logs/logstoolbar/logstoolbar_controller';

describe('Logs toolbar controller', () => {

  /** @type {string} */
  const iconColorClassName = 'kd-logs-color-icon';

  /** @type {string} */
  const iconSizeClassName = 'kd-logs-size-icon';

  /** @type {string} */
  const mockNamespace = 'namespace';

  /** @type {string} */
  const mockReplicationController = 'replicationController';

  /** @type {string} */
  const mockPodId = 'pod2';

  /** @type {string} */
  const mockContainer = 'con22';

  /** @type {!backendApi.Logs} */
  const logs = {
    container: mockContainer,
  };

  /** @type {!StateParams} */
  const stateParams =
      new StateParams(mockNamespace, mockReplicationController, mockPodId, mockContainer);

  /** @type {!backendApi.PodContainers} */
  const podContainers = {containers: ['con1']};

  /**
   * Logs menu controller.
   * @type {!LogsToolbarController}
   */
  let ctrl;

  /** @type {!ui.router.$state} */
  let state;

  beforeEach(() => {
    angular.mock.module(LogsModule.name);

    angular.mock.inject(($controller, $state) => {
      state = $state;
      ctrl = $controller(
          LogsToolbarController, {
            $stateParams: stateParams,
            podLogs: logs,
            podContainers: podContainers,
          },
          $state);
    });
  });

  it('should instantiate the controller properly', () => { expect(ctrl).not.toBeUndefined(); });

  it('should find objects (pod and container) by name passed in state params',
     () => { expect(ctrl.container).toEqual('pod2'); });

  it('should call transitionTo on container change', () => {
    // given
    spyOn(state, 'transitionTo');

    // when
    ctrl.onContainerChange('container');

    // then
    expect(state.transitionTo).toHaveBeenCalled();
  });

  it('should return style class for icon', () => {
    // then
    expect(ctrl.getColorIconClass()).toEqual(`${iconColorClassName}`);
    expect(ctrl.getSizeIconClass()).toEqual(`${iconSizeClassName}`);
  });
});
