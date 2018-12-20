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

import ReplicationControllerDetailController from 'replicationcontroller/detail/controller';
import replicationControllerModule from 'replicationcontroller/module';

describe('Replication Controller Detail controller', () => {
  /**
   * Replication Controller Detail controller.
   * @type {!ReplicationControllerDetailController}
   */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(replicationControllerModule.name);

    angular.mock.inject(($controller) => {
      ctrl = $controller(ReplicationControllerDetailController, {
        replicationControllerDetail: {},
        replicationControllerEvents: {},
        $stateParams: {objectName: 'foo-replicationcontroller', objectNamespace: 'foo-namespace'},
      });
    });
  });

  it('should show/hide cpu and memory metrics for pods', () => {
    expect(ctrl.hasMemoryUsage({})).toBe(false);
    expect(ctrl.hasMemoryUsage({metrics: {}})).toBe(false);
    expect(ctrl.hasMemoryUsage({metrics: {memoryUsageHistory: []}})).toBe(false);
    expect(ctrl.hasMemoryUsage({metrics: {memoryUsageHistory: [0]}})).toBe(true);
    expect(ctrl.hasMemoryUsage({metrics: {memoryUsageHistory: [1]}})).toBe(true);
    expect(ctrl.hasMemoryUsage({metrics: {memoryUsageHistory: null}})).toBe(false);
    expect(ctrl.hasMemoryUsage({metrics: {memoryUsageHistory: undefined}})).toBe(false);
    expect(ctrl.hasMemoryUsage({metrics: {cpuUsageHistory: [1]}})).toBe(false);

    expect(ctrl.hasCpuUsage({})).toBe(false);
    expect(ctrl.hasCpuUsage({metrics: {}})).toBe(false);
    expect(ctrl.hasCpuUsage({metrics: {memoryUsageHistory: []}})).toBe(false);
    expect(ctrl.hasCpuUsage({metrics: {memoryUsageHistory: [1]}})).toBe(false);
    expect(ctrl.hasCpuUsage({metrics: {memoryUsageHistory: null}})).toBe(false);
    expect(ctrl.hasCpuUsage({metrics: {memoryUsageHistory: undefined}})).toBe(false);
    expect(ctrl.hasCpuUsage({metrics: {cpuUsageHistory: [1]}})).toBe(true);
    expect(ctrl.hasCpuUsage({metrics: {cpuUsageHistory: [0]}})).toBe(true);
    expect(ctrl.hasCpuUsage({metrics: {cpuUsageHistory: []}})).toBe(false);
    expect(ctrl.hasCpuUsage({metrics: {cpuUsageHistory: null}})).toBe(false);
    expect(ctrl.hasCpuUsage({metrics: {cpuUsageHistory: undefined}})).toBe(false);
  });
});
