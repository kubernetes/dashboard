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

import {StateParams} from 'replicasetdetail/replicasetdetail_state';
import ReplicaSetCardMenuController from 'replicasetlist/replicasetcardmenu_controller';
import replicaSetListModule from 'replicasetlist/replicasetlist_module';

describe('Replica set card menu controller', () => {
  /** @type {!ReplicaSetCardMenuController} */
  let ctrl;
  /** @type {!ui.router.$state} */
  let state;
  /** @type {!angular.Scope} */
  let scope;
  /** @type {!replicasetdetail/replicaset_service.ReplicaSetService} */
  let kdReplicaSetService;

  beforeEach(() => {
    angular.mock.module(replicaSetListModule.name);

    angular.mock.inject(($controller, $state, _kdReplicaSetService_, $rootScope) => {
      state = $state;
      kdReplicaSetService = _kdReplicaSetService_;
      scope = $rootScope;
      ctrl = $controller(
          ReplicaSetCardMenuController, null,
          {replicaSet: {name: 'foo-name', namespace: 'foo-namespace'}});
    });
  });

  it('should view details', () => {
    // given
    spyOn(state, 'go');

    // when
    ctrl.viewDetails();

    // then
    expect(state.go)
        .toHaveBeenCalledWith('replicasetdetail', new StateParams('foo-namespace', 'foo-name'));
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
    spyOn(kdReplicaSetService, 'showDeleteDialog').and.returnValue(deferred.promise);

    // when
    ctrl.showDeleteDialog();
    deferred.resolve();

    // then
    expect(state.reload).not.toHaveBeenCalled();
    scope.$apply();
    expect(state.reload).toHaveBeenCalled();
  }));

  it('should log on delete error', angular.mock.inject(($q, $log) => {
    // given
    let deferred = $q.defer();
    spyOn($log, 'error');
    spyOn(state, 'reload');
    spyOn(kdReplicaSetService, 'showDeleteDialog').and.returnValue(deferred.promise);

    // when
    ctrl.showDeleteDialog();
    deferred.reject();

    // then
    expect(state.reload).not.toHaveBeenCalled();
    expect($log.error).not.toHaveBeenCalled();
    scope.$apply();
    expect(state.reload).not.toHaveBeenCalled();
    expect($log.error).toHaveBeenCalled();
  }));

  it('should show update replicas dialog', () => {
    // given
    ctrl.replicaSet = {
      namespace: '',
      name: '',
      pods: {
        current: 1,
        desired: 1,
      },
    };
    spyOn(kdReplicaSetService, 'showUpdateReplicasDialog');

    // when
    ctrl.showUpdateReplicasDialog();

    // then
    expect(kdReplicaSetService.showUpdateReplicasDialog).toHaveBeenCalled();
  });
});
