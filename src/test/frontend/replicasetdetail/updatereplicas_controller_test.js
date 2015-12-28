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

describe('Replica Set Detail controller', () => {
  /**
   * Replica Set Detail controller.
   * @type {!ReplicaSetDetailController}
   */
  let ctrl;

  /** @type {!md.$dialog} */
  let mdDialog;

  /** @type {!angular.$log} */
  let log;

  /**
   * First parameter behavior is changed to indicate successful/failed update.
   * @param {!boolean} isError
   * @param {!function(!backendApi.ReplicaSetSpec)} onSuccess
   * @param {!function(!angular.$http.Response)} onError
   */
  let mockUpdateReplicasFn = function(isError, onSuccess, onError) {
    if (isError) {
      onError();
    } else {
      onSuccess();
    }
  };

  beforeEach(() => {
    angular.mock.module(replicaSetDetailModule.name);

    angular.mock.inject(($resource, $log, $state, $mdDialog) => {
      mdDialog = $mdDialog;
      log = $log;

      ctrl = new UpdateReplicasDialogController(mdDialog, log, {}, mockUpdateReplicasFn);
    });
  });

  it('should log success after edit replicas and hide the dialog', () => {
    // given
    spyOn(log, 'info');
    spyOn(mdDialog, 'hide');
    // Indicates if there was error during update
    ctrl.replicas = false;

    // when
    ctrl.updateReplicasCount();

    // then
    expect(log.info).toHaveBeenCalledWith('Successfully updated replica set.');
    expect(mdDialog.hide).toHaveBeenCalled();
  });

  it('should log error after edit replicas and hide the dialog', () => {
    // given
    spyOn(log, 'error');
    spyOn(mdDialog, 'hide');
    // Indicates if there was error during update
    ctrl.replicas = true;

    // when
    ctrl.updateReplicasCount();

    // then
    expect(log.error).toHaveBeenCalled();
    expect(mdDialog.hide).toHaveBeenCalled();
  });

  it('should close the dialog on cancel', () => {
    // given
    spyOn(mdDialog, 'cancel');

    // when
    ctrl.cancel();

    // then
    expect(mdDialog.cancel).toHaveBeenCalled();
  });
});
