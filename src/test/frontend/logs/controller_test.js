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

import {LogsController} from 'logs/controller';
import LogsModule from 'logs/module';
import {StateParams} from 'logs/state';

describe('Logs controller', () => {

  /** @type {string} */
  const logsTextColorClassName = 'kd-logs-text-color-invert';

  /** @type {string} */
  const logsTextSizeClassName = 'kd-logs-element';

  /** @type {!LogsController} */
  let ctrl;

  /** @type {!angular.$httpBackend} */
  let httpBackend;

  /** @type {string} */
  const mockNamespace = 'namespace11';

  /** @type {string} */
  const mockPodId = 'pod2';

  /** @type {string} */
  const mockContainer = 'con22';

  /** @type {!StateParams} */
  const stateParams = new StateParams(mockNamespace, mockPodId, mockContainer);

  /** @type {!backendApi.PodContainers} */
  const podContainers = {containers: [mockContainer]};

  let podLogs = {
    logs: [
      {timestamp: '1', content: 'a'},
      {timestamp: '2', content: 'b'},
      {timestamp: '3', content: 'c'},
    ],
    info: {podName: 'test-pod', containerName: 'container-name', fromDate: '1', toDate: '3'},
    selection: {
      referencePoint: {'timestamp': 'X', 'lineNum': 11},
      'offsetFrom': 22,
      'offsetTo': 25,
    },
  };

  let otherLogs = {
    logs: [{timestamp: '7', content: 'x'}, {timestamp: '8', content: 'y'}],
    info: {},
    selection: {
      referencePoint: {'timestamp': 'Y', 'lineNum': 12},
      'offsetFrom': 33,
      'offsetTo': 35,
    },
  };

  beforeEach(() => {
    angular.mock.module(LogsModule.name);

    angular.mock.inject(($controller, $httpBackend) => {
      ctrl = $controller(LogsController, {
        podLogs: angular.copy(podLogs),
        podContainers: podContainers,
        $stateParams: stateParams,
      });
      httpBackend = $httpBackend;
    });
  });

  it('should instantiate the controller properly', () => {
    expect(ctrl).not.toBeUndefined();
  });

  it('should return style classes for logs content', () => {
    // expect
    expect(ctrl.getStyleClass()).toEqual(`${logsTextColorClassName}`);
    expect(ctrl.getLogsClass()).toEqual(`${logsTextSizeClassName}`);
  });

  it('should display zero state log line if server returned no logs', () => {
    ctrl.podLogs.logs = [];
    ctrl.$onInit();
    expect(ctrl.logsSet.length).toEqual(1);
  });

  it('should display logs', () => {
    ctrl.$onInit();
    expect(ctrl.logsSet.length).toEqual(3);
  });

  it('should not contain timestamp by default', () => {
    ctrl.$onInit();
    expect(ctrl.logsSet[0].toString()).toEqual('a');
    expect(ctrl.logsSet[1].toString()).toEqual('b');
  });

  it('should contain timestamp when enabling', () => {
    ctrl.logsService.setShowTimestamp();
    ctrl.$onInit();
    expect(ctrl.logsSet[0].toString()).toEqual('1 a');
    expect(ctrl.logsSet[1].toString()).toEqual('2 b');
  });

  it('should load newer logs on loadNewer call', () => {
    ctrl.$onInit();
    ctrl.loadNewer();
    expect(ctrl.logsSet.length).toEqual(3);
    httpBackend
        .expectGET(
            'api/v1/pod/namespace11/pod2/log/con22?offsetFrom=25&offsetTo=125&referenceLineNum=11&referenceTimestamp=X')
        .respond(200, otherLogs);
    httpBackend.flush();
    expect(ctrl.logsSet.length).toEqual(2);
    expect(ctrl.currentSelection).toEqual(otherLogs.selection);
  });

  it('should load older logs on loadOlder call', () => {
    ctrl.$onInit();
    ctrl.loadOlder();
    expect(ctrl.logsSet.length).toEqual(3);
    httpBackend
        .expectGET(
            'api/v1/pod/namespace11/pod2/log/con22?offsetFrom=-78&offsetTo=22&referenceLineNum=11&referenceTimestamp=X')
        .respond(200, otherLogs);
    httpBackend.flush();
    expect(ctrl.logsSet.length).toEqual(2);
    expect(ctrl.currentSelection).toEqual(otherLogs.selection);
  });

  it('should load newest logs on loadNewest call', () => {
    ctrl.$onInit();
    ctrl.loadNewest();
    expect(ctrl.logsSet.length).toEqual(3);
    httpBackend
        .expectGET(
            'api/v1/pod/namespace11/pod2/log/con22?offsetFrom=2000000000&offsetTo=2000000100&referenceLineNum=11&referenceTimestamp=X')
        .respond(200, otherLogs);
    httpBackend.flush();
    expect(ctrl.logsSet.length).toEqual(2);
    expect(ctrl.currentSelection).toEqual(otherLogs.selection);

  });

  it('should load oldest logs on loadOldest call', () => {
    ctrl.$onInit();
    ctrl.loadOldest();
    expect(ctrl.logsSet.length).toEqual(3);
    httpBackend
        .expectGET(
            'api/v1/pod/namespace11/pod2/log/con22?offsetFrom=-2000000100&offsetTo=-2000000000&referenceLineNum=11&referenceTimestamp=X')
        .respond(200, otherLogs);
    httpBackend.flush();
    expect(ctrl.logsSet.length).toEqual(2);
    expect(ctrl.currentSelection).toEqual(otherLogs.selection);
  });
});
