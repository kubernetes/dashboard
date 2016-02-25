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

import ReplicationControllerDetailController from 'replicationcontrollerdetail/replicationcontrollerdetail_controller';
import replicationControllerDetailModule from 'replicationcontrollerdetail/replicationcontrollerdetail_module';

describe('Replication Controller Detail controller', () => {
  /**
   * Replication Controller Detail controller.
   * @type {!ReplicationControllerDetailController}
   */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(replicationControllerDetailModule.name);

    angular.mock.inject(($controller, $resource) => {
      ctrl = $controller(ReplicationControllerDetailController, {
        replicationControllerDetail: {},
        replicationControllerEvents: {},
        replicationControllerDetailResource: $resource('/foo'),
        replicationControllerSpecPodsResource: $resource('/bar'),
        $stateParams:
            {replicationController: 'foo-replicationcontroller', namespace: 'foo-namespace'},
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

  it('should create logs href', () => {
    expect(ctrl.getPodLogsHref({
      name: 'foo-pod',
    })).toBe('#/logs/foo-namespace/foo-replicationcontroller/foo-pod/');
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

  it('should show/hide cpu and memory metrics for pods', () => {
    expect(ctrl.hasMemoryUsage({})).toBe(false);
    expect(ctrl.hasMemoryUsage({metrics: {}})).toBe(false);
    expect(ctrl.hasMemoryUsage({metrics: {memoryUsage: 0}})).toBe(true);
    expect(ctrl.hasMemoryUsage({metrics: {memoryUsage: 1}})).toBe(true);
    expect(ctrl.hasMemoryUsage({metrics: {memoryUsage: null}})).toBe(false);
    expect(ctrl.hasMemoryUsage({metrics: {memoryUsage: undefined}})).toBe(false);
    expect(ctrl.hasMemoryUsage({metrics: {cpuUsage: 1}})).toBe(false);

    expect(ctrl.hasCpuUsage({})).toBe(false);
    expect(ctrl.hasCpuUsage({metrics: {}})).toBe(false);
    expect(ctrl.hasCpuUsage({metrics: {memoryUsage: 0}})).toBe(false);
    expect(ctrl.hasCpuUsage({metrics: {memoryUsage: 1}})).toBe(false);
    expect(ctrl.hasCpuUsage({metrics: {memoryUsage: null}})).toBe(false);
    expect(ctrl.hasCpuUsage({metrics: {memoryUsage: undefined}})).toBe(false);
    expect(ctrl.hasCpuUsage({metrics: {cpuUsage: 1}})).toBe(true);
    expect(ctrl.hasCpuUsage({metrics: {cpuUsage: 0}})).toBe(true);
    expect(ctrl.hasCpuUsage({metrics: {cpuUsage: null}})).toBe(false);
    expect(ctrl.hasCpuUsage({metrics: {cpuUsage: undefined}})).toBe(false);
  });
});
