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

import daemonSetModule from 'daemonset/module';

describe('Daemon Set Info controller', () => {
  /**
   * Daemon Set Info controller.
   * @type {!DaemonSetInfoController}
   */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(daemonSetModule.name);
    angular.mock.inject(($componentController, $rootScope) => {
      ctrl = $componentController('kdDaemonSetInfo', {$scope: $rootScope}, {
        daemonSet: {
          podInfo: {
            running: 0,
            desired: 0,
            failed: 0,
            current: 0,
            pending: 0,
          },
        },
      });
    });
  });

  it('should return true when all desired pods are running', () => {
    // given
    ctrl.daemonSet = {
      podInfo: {
        running: 0,
        desired: 0,
      },
    };

    // then
    expect(ctrl.areDesiredPodsRunning()).toBeTruthy();
  });

  it('should return false when not all desired pods are running', () => {
    // given
    ctrl.daemonSet = {
      podInfo: {
        running: 0,
        desired: 1,
      },
    };

    // then
    expect(ctrl.areDesiredPodsRunning()).toBeFalsy();
  });
});
