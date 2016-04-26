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

import {StateParams} from 'replicationcontrollerdetail/replicationcontrollerdetail_state';
import ReplicationControllerCardMenuController from 'replicationcontrollerlistdeprecated/replicationcontrollercardmenu_controller';
import replicationControllerListModule from 'replicationcontrollerlistdeprecated/replicationcontrollerlist_module';

describe('Replication controller card menu controller', () => {
  /** @type {!ReplicationControllerCardMenuController} */
  let ctrl;
  /** @type {!ui.router.$state} */
  let state;
  /** @type {!angular.Scope} */
  let scope;
  /** @type
   * {!replicationcontrollerdetail/replicationcontroller_service.ReplicationControllerService} */
  let kdReplicationControllerService;

  beforeEach(() => {
    angular.mock.module(replicationControllerListModule.name);

    angular.mock.inject(($controller, $state, _kdReplicationControllerService_, $rootScope) => {
      state = $state;
      kdReplicationControllerService = _kdReplicationControllerService_;
      scope = $rootScope;
      ctrl = $controller(
          ReplicationControllerCardMenuController, null,
          {replicationController: {name: 'foo-name', namespace: 'foo-namespace'}});
    });
  });

  it('should view details', () => {
    // given
    spyOn(state, 'go');

    // when
    ctrl.viewDetails();

    // then
    expect(state.go).toHaveBeenCalledWith(
        'replicationcontrollerdetail', new StateParams('foo-namespace', 'foo-name'));
  });

  it('should open the menu', () => {
    // given
    let openMenuFn = jasmine.createSpy();
    let event = {};

    // when
    ctrl.openMenu(openMenuFn, event);

    // then
    expect(openMenuFn).toHaveBeenCalledWith(event);
  });

  it('should reload on successful delete', angular.mock.inject(($q) => {
    // given
    let deferred = $q.defer();
    spyOn(state, 'reload');
    spyOn(kdReplicationControllerService, 'showDeleteDialog').and.returnValue(deferred.promise);

    // when
    ctrl.showDeleteDialog();
    deferred.resolve();

    // then
    expect(state.reload).not.toHaveBeenCalled();
    scope.$apply();
    expect(state.reload).toHaveBeenCalled();
  }));

  it('should show update replicas dialog', () => {
    // given
    ctrl.replicationController = {
      namespace: '',
      name: '',
      pods: {
        current: 1,
        desired: 1,
      },
    };
    spyOn(kdReplicationControllerService, 'showUpdateReplicasDialog');

    // when
    ctrl.showUpdateReplicasDialog();

    // then
    expect(kdReplicationControllerService.showUpdateReplicasDialog).toHaveBeenCalled();
  });
});
