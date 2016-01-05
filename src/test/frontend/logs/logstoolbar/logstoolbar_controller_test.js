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

import LogsToolbarController from 'logs/logstoolbar/logstoolbar_controller';
import LogsModule from 'logs/logs_module';
import {StateParams} from 'logs/logs_state';

describe('Logs toolbar controller', () => {

  /** @type {string} */
  const iconColorClassName = 'kd-logs-color-icon';

  /** @type {string} */
  const mockNamespace = 'namespace';

  /** @type {string} */
  const mockReplicaSet = 'replicaSet';

  /** @type {string} */
  const mockPodId = 'pod2';

  /** @type {string} */
  const mockContainer = 'con22';

  /** @type {!backendApi.PodContainer} */
  const expectedContainer = {name: mockContainer};

  /** @type {!backendApi.ReplicaSetPodWithContainers} */
  const expectedPod = {name: mockPodId, podContainers: [{name: 'con21'}, expectedContainer]};

  /** @type {!Array<!backendApi.ReplicaSetPodWithContainers>} */
  const replicaSetPods = {
    pods: [
      {name: 'pod1', podContainers: [{name: 'con1'}]},
      expectedPod,
      {name: 'pod3', podContainers: [{name: 'con3'}]},
    ],
  };

  /** @type {!StateParams} */
  const stateParams = new StateParams(mockNamespace, mockReplicaSet, mockPodId, mockContainer);

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
          LogsToolbarController, {replicaSetPods: replicaSetPods, $stateParams: stateParams},
          $state);
    });
  });

  it('should instantiate the controller properly', () => { expect(ctrl).not.toBeUndefined(); });

  it('should invert flag isTextColorInverted when onTextColorChange called', () => {
    // before
    expect(ctrl.isTextColorInverted()).toBeFalsy();
    // when
    ctrl.onTextColorChange();
    // then
    expect(ctrl.isTextColorInverted()).toBeTruthy();
  });

  it('should find objects (pod and container) by name passed in state params', () => {
    // given
    let resultPod = ctrl.pod;
    let resulContainer = ctrl.container;

    expect(resultPod).toEqual(expectedPod);
    expect(resulContainer).toEqual(expectedContainer);
  });

  it('should call transitionTo on pod change', () => {
    // given
    spyOn(state, 'transitionTo');

    // when
    ctrl.onPodChange("pod3");

    // then
    expect(state.transitionTo).toHaveBeenCalled();
  });

  it('should call transitionTo on container change', () => {
    // given
    spyOn(state, 'transitionTo');

    // when
    ctrl.onContainerChange("container");

    // then
    expect(state.transitionTo).toHaveBeenCalled();
  });

  it('should return style class for icon', () => {
    // expect
    expect(ctrl.getStyleClass()).toEqual(`${iconColorClassName}`);
  });
});
