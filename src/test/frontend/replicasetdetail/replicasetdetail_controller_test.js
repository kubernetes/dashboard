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

import ReplicaSetDetailController from 'replicasetdetail/replicasetdetail_controller';
import replicaSetDetailModule from 'replicasetdetail/replicasetdetail_module';

describe('Replica Set Detail controller', () => {
  /**
   * Replica Set Detail controller.
   * @type {!ReplicaSetDetailController}
   */
  let ctrl;
  /** @type {!replicasetdetail/replicaset_service.ReplicaSetService} */
  let kdReplicaSetService;
  /** @type {!angular.$q} */
  let q;

  beforeEach(() => {
    angular.mock.module(replicaSetDetailModule.name);

    angular.mock.inject(($controller, $resource, $q, _kdReplicaSetService_) => {
      q = $q;
      kdReplicaSetService = _kdReplicaSetService_;
      ctrl = $controller(ReplicaSetDetailController, {
        replicaSetDetail: {},
        replicaSetEvents: {},
        replicaSetDetailResource: $resource('/foo'),
        replicaSetSpecPodsResource: $resource('/bar'),
        $stateParams: {replicaSet: 'foo-replicaset', namespace: 'foo-namespace'},
      });
    });
  });

  it('should not filter any events if all option is selected', () => {
    // given
    let eventType = 'All';
    let events = [
      {
        type: "Warning",
        message: "event-1",
      },
      {
        type: "Normal",
        message: "event-2",
      },
    ];

    // when
    let result = ctrl.filterByType(events, eventType);

    // then
    expect(result.length).toEqual(2);
  });

  it('should filter all non-warning events if warning option is selected', () => {
    // given
    let eventType = 'Warning';
    let events = [
      {
        type: "Warning",
        message: "event-1",
      },
      {
        type: "Normal",
        message: "event-2",
      },
      {
        type: "Normal",
        message: "event-3",
      },
    ];

    // when
    let result = ctrl.filterByType(events, eventType);

    // then
    expect(result.length).toEqual(1);
  });

  it('should show edit replicas dialog', () => {
    // given
    ctrl.replicaSetDetail = {
      namespace: 'foo-namespace',
      name: 'foo-name',
      podInfo: {
        current: 3,
        desired: 3,
      },
    };
    spyOn(kdReplicaSetService, 'showUpdateReplicasDialog');

    // when
    ctrl.handleUpdateReplicasDialog();

    // then
    expect(kdReplicaSetService.showUpdateReplicasDialog).toHaveBeenCalled();
  });

  it('should create logs href', () => {
    expect(ctrl.getPodLogsHref({
      name: 'foo-pod',
    })).toBe('#/logs/foo-namespace/foo-replicaset/foo-pod/');
  });

  it('should show delete replicas dialog', () => {
    // given
    let deferred = q.defer();
    spyOn(kdReplicaSetService, 'showDeleteDialog').and.returnValue(deferred.promise);

    // when
    ctrl.handleDeleteReplicaSetDialog();

    // then
    expect(kdReplicaSetService.showDeleteDialog).toHaveBeenCalled();
  });

  it('should return true when there are events to display', () => {
    // given
    ctrl.events = ["Some event"];

    // when
    let result = ctrl.hasEvents();

    // then
    expect(result).toBeTruthy();
  });

  it('should return false if there are no events to display', () => {
    // when
    let result = ctrl.hasEvents();

    // then
    expect(result).toBeFalsy();
  });

  it('should return true when all desired pods are running', () => {
    // given
    ctrl.replicaSetDetail = {
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
    ctrl.replicaSetDetail = {
      podInfo: {
        running: 0,
        desired: 1,
      },
    };

    // then
    expect(ctrl.areDesiredPodsRunning()).toBeFalsy();
  });
});
