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

import replicationControllerListModule from 'replicationcontrollerlist/replicationcontrollerlist_module';

describe('Pod logs menu controller', () => {
  /**
   * Logs menu controller.
   * @type {!replicationcontrollerlist/podlogsmenu_component.PodLogsMenuController}
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

    angular.mock.inject(($componentController, $state, $rootScope) => {
      state = $state;
      ctrl = $componentController('kdPodLogsMenu', {$scope: $rootScope});
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

  it('should do nothing on initial open menu', () => {
    // when
    ctrl.openMenu(mdOpenMenu);

    // then
    expect(ctrl.replicationControllerPodsList).toEqual(undefined);
  });

  it('should fetch pods from the backend', angular.mock.inject(($rootScope, $httpBackend) => {
    // when
    ctrl.openMenu(mdOpenMenu);

    let pods = {};
    $httpBackend.whenGET('api/v1/replicationcontroller/pod/undefined/undefined?limit=10').respond({
      pods: pods,
    });
    $rootScope.$digest();
    expect(ctrl.replicationControllerPodsList).toEqual(undefined);

    $httpBackend.flush();
    expect(ctrl.replicationControllerPodsList).toEqual(pods);
  }));

  it('should log on fetch pods from the backend error',
     angular.mock.inject(($log, $httpBackend) => {
       // when
       ctrl.openMenu(mdOpenMenu);

       spyOn($log, 'error').and.callThrough();
       let err = {};
       $httpBackend.whenGET('api/v1/replicationcontroller/pod/undefined/undefined?limit=10')
           .respond(500, err);
       $httpBackend.flush();
       expect($log.error).toHaveBeenCalled();
     }));

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
    expect(ctrl.podContainersRestarted(pod)).toBe(false);
  });

  it('should return true when pod containers were restarted', () => {
    // when
    let pod = {
      'totalRestartCount': 1,
    };
    // then
    expect(ctrl.podContainersRestarted(pod)).toBe(true);
  });

  it('should return false there is no pod', () => {
    // then
    expect(ctrl.podContainersRestarted(null)).toBe(false);
  });
});
