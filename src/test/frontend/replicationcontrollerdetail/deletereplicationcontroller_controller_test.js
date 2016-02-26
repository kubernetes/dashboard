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

import DeleteReplicationControllerDialogController from 'replicationcontrollerdetail/deletereplicationcontroller_controller';
import replicationControllerDetailModule from 'replicationcontrollerdetail/replicationcontrollerdetail_module';

describe('Delete replication controller dialog controller', () => {
  /** @type {!DeleteReplicationControllerDialogController} */
  let ctrl;
  /** @type {!md.$dialog} */
  let mdDialog;
  /** @type {!angular.$httpBackend} */
  let httpBackend;

  let namespaceMock = 'foo-namespace';
  let replicationControllerMock = 'foo-name';

  beforeEach(() => {
    angular.mock.module(replicationControllerDetailModule.name);

    angular.mock.inject(($log, $mdDialog, $controller, $httpBackend) => {
      mdDialog = $mdDialog;
      httpBackend = $httpBackend;

      ctrl = $controller(DeleteReplicationControllerDialogController, {
        namespace: namespaceMock,
        replicationController: replicationControllerMock,
      });
    });
  });

  it('should cancel', () => {
    // given
    spyOn(mdDialog, 'cancel');

    // when
    ctrl.cancel();

    // then
    expect(mdDialog.cancel).toHaveBeenCalled();
  });

  it('should delete without services', () => {
    // given
    spyOn(mdDialog, 'hide');
    ctrl.deleteServices = false;

    // when
    httpBackend
        .whenDELETE('api/v1/replicationcontrollers/foo-namespace/foo-name?deleteServices=false')
        .respond(200, {});
    ctrl.remove();
    httpBackend.flush();

    // then
    expect(mdDialog.hide).toHaveBeenCalled();
  });

  it('should delete with services', () => {
    // given
    spyOn(mdDialog, 'hide');

    // when
    httpBackend
        .whenDELETE('api/v1/replicationcontrollers/foo-namespace/foo-name?deleteServices=true')
        .respond(200, {});
    ctrl.remove();
    httpBackend.flush();

    // then
    expect(mdDialog.hide).toHaveBeenCalled();
  });

  it('should cancel on delete failure', () => {
    // given
    spyOn(mdDialog, 'cancel');

    // when
    httpBackend
        .whenDELETE('api/v1/replicationcontrollers/foo-namespace/foo-name?deleteServices=true')
        .respond(503, {});
    ctrl.remove();
    httpBackend.flush();

    // then
    expect(mdDialog.cancel).toHaveBeenCalled();
  });
});
