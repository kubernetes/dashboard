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

import UpdateReplicasDialogController from 'replicasetdetail/updatereplicas_controller';
import replicaSetDetailModule from 'replicasetdetail/replicasetdetail_module';

describe('Update Replicas controller', () => {
  /**
   * Replica Set Detail controller.
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
  let replicaSetMock = 'foo-name';

  beforeEach(() => {
    angular.mock.module(replicaSetDetailModule.name);

    angular.mock.inject(($log, $state, $mdDialog, $controller, $httpBackend, $resource) => {
      mdDialog = $mdDialog;
      state = $state;
      resource = $resource;
      httpBackend = $httpBackend;
      log = $log;

      ctrl = $controller(UpdateReplicasDialogController, {
        $resource: resource,
        namespace: namespaceMock,
        replicaSet: replicaSetMock,
        currentPods: 1,
        desiredPods: 1,
      });
    });
  });

  it('should update controller replicas to given number and log success', () => {
    // given
    let replicaSpec = {
      replicas: 5,
    };
    spyOn(log, 'info');
    spyOn(state, 'reload');
    httpBackend.whenPOST('api/replicasets/foo-namespace/foo-name/update/pods')
        .respond(200, replicaSpec);

    // when
    ctrl.updateReplicas();
    httpBackend.flush();

    // then
    expect(log.info)
        .toHaveBeenCalledWith(`Successfully updated replicas number to ${replicaSpec.replicas}`);
    expect(state.reload).toHaveBeenCalled();
  });

  it('should log error on failed update', () => {
    // given
    spyOn(log, 'error');
    httpBackend.whenPOST('api/replicasets/foo-namespace/foo-name/update/pods').respond(404);

    // when
    ctrl.updateReplicas();
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
