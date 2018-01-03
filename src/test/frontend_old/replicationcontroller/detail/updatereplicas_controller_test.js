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

import UpdateReplicasDialogController from 'common/scaling/controller';
import replicationControllerModule from 'replicationcontroller/module';

describe('Update Replicas controller', () => {
  /**
   * Replication Controller Detail controller.
   * @type {!UpdateReplicasDialogController}
   */
  let ctrl;
  /** @type {!md.$dialog} */
  let mdDialog;
  /** @type {!ui.router.$state} */
  let state;
  /** @type {!angular.$resource} */
  let resource;
  /** @type {!angular.$httpBackend} */
  let httpBackend;
  /** @type {!angular.$log} */
  let log;

  /** @type {string} */
  let namespaceMock = 'foo-namespace';
  /** @type {string} */
  let replicationControllerMock = 'foo-name';
  /** @type {string} */
  let resourceKindNameMock = 'replicationcontroller';

  beforeEach(() => {
    angular.mock.module(replicationControllerModule.name);

    angular.mock.inject(($log, $state, $mdDialog, $controller, $httpBackend, $resource) => {
      mdDialog = $mdDialog;
      state = $state;
      resource = $resource;
      httpBackend = $httpBackend;
      log = $log;

      ctrl = $controller(
          UpdateReplicasDialogController, {
            $resource: resource,
            namespace: namespaceMock,
            currentPods: 1,
            desiredPods: 2,
            resourceName: replicationControllerMock,
            resourceKindName: resourceKindNameMock,
            resourceKindDisplayName: resourceKindNameMock,
          },
          {updateReplicasForm: {$valid: true}});
    });
  });

  it('should update controller replicas to given number and log success', () => {
    // given
    let replicaCounts = {
      desiredReplicas: 2,
      actualReplicas: 1,
    };
    spyOn(log, 'info');
    spyOn(state, 'reload');
    httpBackend.whenPUT('api/v1/scale/replicationcontroller/foo-namespace/foo-name?scaleBy=2')
        .respond(200, replicaCounts);

    // when
    ctrl.scaleResource();
    httpBackend.flush();

    // then
    expect(log.info).toHaveBeenCalledWith(
        `Successfully updated replicas number to ${replicaCounts.desiredReplicas}`);
    expect(state.reload).toHaveBeenCalled();
  });

  it('should log error on failed update', () => {
    // given
    spyOn(log, 'error');
    httpBackend.whenPUT('api/v1/scale/replicationcontroller/foo-namespace/foo-name?scaleBy=2')
        .respond(404);

    // when
    ctrl.scaleResource();
    httpBackend.flush();

    // then
    expect(log.error).toHaveBeenCalled();
  });

  it('should close the dialog on cancel', () => {
    spyOn(state, 'reload');

    // given
    spyOn(mdDialog, 'cancel');

    // when
    ctrl.cancel();

    // then
    expect(mdDialog.cancel).toHaveBeenCalled();
    expect(state.reload).not.toHaveBeenCalled();
  });
});
