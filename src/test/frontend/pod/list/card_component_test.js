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

import podModule from 'pod/module';

describe('Pod card controller', () => {
  /**
   * @type {!PodCardController}
   */
  let ctrl;
  /**
   * @type {!NamespaceService}
   */
  let data;

  beforeEach(() => {
    angular.mock.module(podModule.name);

    angular.mock.inject(($componentController, $rootScope, kdNamespaceService) => {
      /** @type {!NamespaceService} */
      data = kdNamespaceService;
      /** @type {!PodCardController} */
      ctrl = $componentController('kdPodCard', {$scope: $rootScope, kdNamespaceService_: data}, {});
    });
  });

  it('should instantiate the controller properly', () => {
    expect(ctrl).not.toBeUndefined();
  });

  it('should return the value from Namespace service', () => {
    expect(ctrl.areMultipleNamespacesSelected()).toBe(data.areMultipleNamespacesSelected());
  });

  it('should execute logs href callback function', () => {
    ctrl.pod = {
      objectMeta: {
        name: 'foo-pod',
        namespace: 'foo-namespace',
      },
    };

    expect(ctrl.getPodDetailHref()).toBe('#!/pod/foo-namespace/foo-pod');
  });

  it('should return true when there is at least one error', () => {
    // given
    ctrl.pod = {
      warnings: [{
        message: 'test-error',
        reason: 'test-reason',
      }],
    };

    // then
    expect(ctrl.hasWarnings()).toBeTruthy();
  });

  it('should return false when there are no errors', () => {
    // given
    ctrl.pod = {
      warnings: [],
      podStatus: {podPhase: 'Test Phase'},
    };

    // then
    expect(ctrl.hasWarnings()).toBeFalsy();
    expect(ctrl.isSuccess()).toBeTruthy;
  });

  it('should show display status correctly (running container)', () => {
    ctrl.pod = {
      podStatus: {podPhase: 'Test Phase', containerStates: [{running: {}}]},
    };

    // Output is expected to be equal to the podPhase.
    expect(ctrl.getDisplayStatus()).toBe('Test Phase');
  });

  it('should handle pods with no container statuses', () => {
    ctrl.pod = {
      podStatus: {podPhase: 'Test Phase'},
    };

    // Output is expected to be equal to the podPhase.
    expect(ctrl.getDisplayStatus()).toBe('Test Phase');
  });

  it('should show display status correctly (waiting container)', () => {
    ctrl.pod = {
      podStatus: {
        podPhase: 'Test Phase',
        containerStates: [{
          waiting: {
            reason: 'Test Reason',
          },
        }],
      },
    };

    expect(ctrl.getDisplayStatus()).toBe('Waiting: Test Reason');
  });

  it('should show display status correctly (terminated container)', () => {
    ctrl.pod = {
      podStatus: {
        podPhase: 'Test Phase',
        containerStates: [{
          terminated: {
            reason: 'Test Reason',
          },
        }],
      },
    };

    expect(ctrl.getDisplayStatus()).toBe('Terminated: Test Reason');
  });

  it('should show display status correctly (multi container)', () => {
    ctrl.pod = {
      podStatus: {
        podPhase: 'Test Phase',
        containerStates: [
          {running: {}},
          {
            terminated: {
              reason: 'Test Terminated Reason',
            },
          },
          {waiting: {reason: 'Test Waiting Reason'}},
        ],
      },
    };

    expect(ctrl.getDisplayStatus()).toBe('Terminated: Test Terminated Reason');
  });

  it('should check pod status correctly (success is successful)', () => {
    ctrl.pod = {name: 'test-pod', podStatus: {status: 'Succeeded'}, warnings: []};
    expect(ctrl.isSuccess()).toBeTruthy();
  });

  it('should check pod status correctly (failed isn\'t successful)', () => {
    ctrl.pod = {name: 'test-pod', podStatus: {status: 'Failed'}, warnings: []};
    expect(ctrl.isSuccess()).toBeFalsy();
  });

  it('should check pod status correctly (pending is pending)', () => {
    ctrl.pod = {name: 'test-pod', podStatus: {status: 'Pending'}, warnings: []};
    expect(ctrl.isPending()).toBeTruthy();
  });

  it('should check pod status correctly (failed isn\'t pending)', () => {
    ctrl.pod = {name: 'test-pod', podStatus: {status: 'Failed'}, warnings: []};
    expect(ctrl.isPending()).toBeFalsy();
  });

  it('should check pod status correctly (failed is failed)', () => {
    ctrl.pod = {name: 'test-pod', podStatus: {status: 'Failed'}, warnings: []};
    expect(ctrl.isFailed()).toBeTruthy();
  });

  it('should check pod status correctly (success isn\'t failed)', () => {
    ctrl.pod = {name: 'test-pod', podStatus: {podPhase: 'Succeeded'}, warnings: []};
    expect(ctrl.isFailed()).toBeFalsy();
  });

  it('should show and hide cpu metrics', () => {
    let cases = [
      {pod: {}, expected: false},
      {pod: {metrics: {}}, expected: false},
      {pod: {metrics: {cpuUsageHistory: []}}, expected: false},
      {pod: {metrics: {cpuUsageHistory: [1]}}, expected: true},
    ];

    cases.forEach((c) => {
      ctrl.pod = c.pod;

      expect(ctrl.hasCpuUsage()).toBe(c.expected);
    });
  });

  it('should show and hide memory metrics', () => {
    let cases = [
      {pod: {}, expected: false},
      {pod: {metrics: {}}, expected: false},
      {pod: {metrics: {memoryUsageHistory: []}}, expected: false},
      {pod: {metrics: {memoryUsageHistory: [1]}}, expected: true},
    ];

    cases.forEach((c) => {
      ctrl.pod = c.pod;

      expect(ctrl.hasMemoryUsage()).toBe(c.expected);
    });
  });
});
