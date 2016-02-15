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

import ReplicationControllerInfoController from 'replicationcontrollerdetail/replicationcontrollerinfo_controller';
import replicationControllerDetailModule from 'replicationcontrollerdetail/replicationcontrollerdetail_module';
import {
  stateName as replicationcontrollers,
} from 'replicationcontrollerlist/replicationcontrollerlist_state';

describe('Replication Controller Detail controller', () => {
  /**
   * Replication Controller Detail controller.
   * @type {!ReplicationControllerDetailController}
   */
  let ctrl;
  /** @type
   * {!replicationcontrollerdetail/replicationcontroller_service.ReplicationControllerService} */
  let kdReplicationControllerService;
  /** @type {!angular.$q} */
  let q;
  /** @type {!ui.router.$state} */
  let state;
  /** @type {!angular.$log} */
  let log;

  beforeEach(() => {
    angular.mock.module(replicationControllerDetailModule.name);

    angular.mock.inject(
        ($controller, $state, $log, $resource, $q, _kdReplicationControllerService_) => {
          q = $q;
          state = $state;
          log = $log;
          kdReplicationControllerService = _kdReplicationControllerService_;
          ctrl = $controller(ReplicationControllerInfoController, {
            replicationControllerDetail: {},
            replicationControllerEvents: {},
            replicationControllerDetailResource: $resource('/foo'),
            replicationControllerSpecPodsResource: $resource('/bar'),
          });
        });
  });

  it('should show edit replicas dialog', () => {
    // given
    ctrl.details = {
      namespace: 'foo-namespace',
      name: 'foo-name',
      podInfo: {
        current: 3,
        desired: 3,
      },
    };
    spyOn(kdReplicationControllerService, 'showUpdateReplicasDialog');

    // when
    ctrl.handleUpdateReplicasDialog();

    // then
    expect(kdReplicationControllerService.showUpdateReplicasDialog).toHaveBeenCalled();
  });

  it('should show delete replicas dialog', () => {
    // given
    let deferred = q.defer();
    spyOn(kdReplicationControllerService, 'showDeleteDialog').and.returnValue(deferred.promise);

    // when
    ctrl.handleDeleteReplicationControllerDialog();

    // then
    expect(kdReplicationControllerService.showDeleteDialog).toHaveBeenCalled();
  });

  it('should return true when all desired pods are running', () => {
    // given
    ctrl.details = {
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
    ctrl.details = {
      podInfo: {
        running: 0,
        desired: 1,
      },
    };

    // then
    expect(ctrl.areDesiredPodsRunning()).toBeFalsy();
  });

  it('should change state to replication controller and log on delete success', () => {
    // given
    spyOn(state, 'go');
    spyOn(log, 'info');

    // when
    ctrl.onReplicationControllerDeleteSuccess_();

    // then
    expect(state.go).toHaveBeenCalledWith(replicationcontrollers);
    expect(log.info).toHaveBeenCalledWith('Replication controller successfully deleted.');
  });

});
