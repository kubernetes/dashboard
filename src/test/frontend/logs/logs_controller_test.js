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

import {LogsController} from 'logs/logs_controller';
import LogsModule from 'logs/logs_module';
import {StateParams} from 'logs/logs_state';

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
    logs: ['1 a', '2 b', '3 c'],
    firstLogLineReference: {'logTimestamp': '1', 'lineNum': -1},
    lastLogLineReference: {logTimestamp: '3', lineNum: -1},
    logViewInfo: {
      referenceLogLineId: {'logTimestamp': 'X', 'lineNum': 11},
      'relativeFrom': 22,
      'relativeTo': 25,
    },
  };

  let otherLogs = {
    logs: ['7 x', '8 y'],
    firstLogLineReference: {'logTimestamp': '7', 'lineNum': -1},
    lastLogLineReference: {logTimestamp: '8', lineNum: -1},
    logViewInfo: {
      referenceLogLineId: {'logTimestamp': 'Y', 'lineNum': 12},
      'relativeFrom': 33,
      'relativeTo': 35,
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

  it('should load newer logs on loadNewer call', () => {
    ctrl.$onInit();
    ctrl.loadNewer();
    expect(ctrl.logsSet.length).toEqual(3);
    httpBackend
        .expectGET(
            /api\/v1\/pod\/namespace11\/pod2\/log\/con22\?referenceLineNum=11&referenceTimestamp=X&relativeFrom=25&relativeTo=\d+/)
        .respond(200, otherLogs);
    httpBackend.flush();
    expect(ctrl.logsSet.length).toEqual(2);
    expect(ctrl.currentLogView).toEqual(otherLogs.logViewInfo);
  });

  it('should load older logs on loadOlder call', () => {
    ctrl.$onInit();
    ctrl.loadOlder();
    expect(ctrl.logsSet.length).toEqual(3);
    httpBackend
        .expectGET(
            /api\/v1\/pod\/namespace11\/pod2\/log\/con22\?referenceLineNum=11&referenceTimestamp=X&relativeFrom=-?\d+&relativeTo=22/)
        .respond(200, otherLogs);
    httpBackend.flush();
    expect(ctrl.logsSet.length).toEqual(2);
    expect(ctrl.currentLogView).toEqual(otherLogs.logViewInfo);
  });

  it('should load newest logs on loadNewest call', () => {
    ctrl.$onInit();
    ctrl.loadNewest();
    expect(ctrl.logsSet.length).toEqual(3);
    httpBackend
        .expectGET(
            /api\/v1\/pod\/namespace11\/pod2\/log\/con22\?referenceLineNum=11&referenceTimestamp=X&relativeFrom=\d+&relativeTo=\d+/)
        .respond(200, otherLogs);
    httpBackend.flush();
    expect(ctrl.logsSet.length).toEqual(2);
    expect(ctrl.currentLogView).toEqual(otherLogs.logViewInfo);

  });

  it('should load oldest logs on loadOldest call', () => {
    ctrl.$onInit();
    ctrl.loadOldest();
    expect(ctrl.logsSet.length).toEqual(3);
    httpBackend
        .expectGET(
            /api\/v1\/pod\/namespace11\/pod2\/log\/con22\?referenceLineNum=11&referenceTimestamp=X&relativeFrom=-\d+&relativeTo=-\d+/)
        .respond(200, otherLogs);
    httpBackend.flush();
    expect(ctrl.logsSet.length).toEqual(2);
    expect(ctrl.currentLogView).toEqual(otherLogs.logViewInfo);
  });
});
