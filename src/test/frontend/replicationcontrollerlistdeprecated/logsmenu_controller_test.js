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

import LogsMenuController from 'replicationcontrollerlistdeprecated/logsmenu_controller';
import replicationControllerListModule from 'replicationcontrollerlistdeprecated/replicationcontrollerlist_module';

describe('Logs menu controller', () => {
  /**
   * Logs menu controller.
   * @type {!LogsMenuController}
   */
  let ctrl;

  /** @type {!ui.router.$state} */
  let state;

  /**
   * @type {!function()} mdOpenMenu
   */
  let mdOpenMenu = function() {};

  beforeEach(() => {
    angular.mock.module(replicationControllerListModule.name);

    angular.mock.inject(($controller, $state) => {
      state = $state;
      ctrl = $controller(LogsMenuController, $state);
    });
  });

  it('should instantiate the controller properly', () => { expect(ctrl).not.toBeUndefined(); });

  it('should clear replicationControllerPodsList on open menu', () => {
    ctrl.replicationControllerPodsList = [
      {
        'name': 'frontend-i0vvd',
        'startTime': '2015-12-08T09:00:34Z',
        'totalRestartCount': 0,
        'podContainers': [
          {
            'name': 'php-redis',
            'restartCount': 0,
          },
        ],
      },
    ];

    // when
    ctrl.openMenu(mdOpenMenu);

    // then
    expect(ctrl.replicationControllerPodsList).toEqual([]);
  });

  it('should call href on log click', () => {
    // given
    spyOn(state, 'href');

    // when
    ctrl.getLogsHref('podName', 'containerName');

    // then
    expect(state.href).toHaveBeenCalled();
  });

  it('should return false when pod does not have any container', () => {
    // when
    let pod = {
      'podContainers': [{}],
    };
    // then
    expect(ctrl.podContainerExists(pod)).toBeFalsy();
  });

  it('should return true when pod has one container', () => {
    // when
    let pod = {
      'podContainers': [
        {
          'name': 'php-redis',
        },
      ],
    };
    // then
    expect(ctrl.podContainerExists(pod)).toBeTruthy();
  });

  it('should return false when pod containers were not restarted', () => {
    // when
    let pod = {
      'totalRestartCount': 0,
    };
    // then
    expect(ctrl.podContainersRestarted(pod)).toBeFalsy();
  });

  it('should return true when pod containers were restarted', () => {
    // when
    let pod = {
      'totalRestartCount': 1,
    };
    // then
    expect(ctrl.podContainersRestarted(pod)).toBeTruthy();
  });
});
