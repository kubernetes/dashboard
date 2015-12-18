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

import LogsMenuController from 'replicasetlist/logsmenu_controller';
import replicaSetListModule from 'replicasetlist/replicasetlist_module';

describe('Logs menu controller', () => {
  /**
   * Logs menu controller.
   * @type {!LogsMenuController}
   */
  let ctrl;

  /**
   * @type {!function()} mdOpenMenu
   */
  let mdOpenMenu = function() {};

  beforeEach(() => {
    angular.mock.module(replicaSetListModule.name);

    angular.mock.inject(($controller) => { ctrl = $controller(LogsMenuController); });
  });

  it('should instantiate the controller properly', () => { expect(ctrl).not.toBeUndefined(); });

  it('should clear replicaSetPodsList on open menu', () => {
    ctrl.replicaSetPodsList = [
      {
        "name": "frontend-i0vvd",
        "startTime": "2015-12-08T09:00:34Z",
        "totalRestartCount": 0,
        "podContainers": [
          {
            "name": "php-redis",
            "restartCount": 0,
          },
        ],
      },
    ];

    // when
    ctrl.openMenu(mdOpenMenu);

    // then
    expect(ctrl.replicaSetPodsList).toEqual([]);
  });
});
