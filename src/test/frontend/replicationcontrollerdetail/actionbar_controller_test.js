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

import {ActionBarController} from 'replicationcontrollerdetail/actionbar_controller';
import replicationControllerDetailModule from 'replicationcontrollerdetail/replicationcontrollerdetail_module';

describe('Replication Controller Detail Action Bar controller', () => {
  /**
   * Replication Controller Detail Action Bar controller.
   * @type {!ReplicationControllerDetailActionBarController}
   */
  let ctrl;
  /** @type
   * {!replicationcontrollerdetail/replicationcontroller_service.ReplicationControllerService} */
  let kdReplicationControllerService;

  beforeEach(() => {
    angular.mock.module(replicationControllerDetailModule.name);

    angular.mock.inject(($controller, $resource, _kdReplicationControllerService_) => {
      kdReplicationControllerService = _kdReplicationControllerService_;

      ctrl = $controller(ActionBarController, {
        replicationControllerDetail: {},
        kdReplicationControllerService: _kdReplicationControllerService_,
      });
    });
  });

  it('should show edit replicas dialog', () => {
    // given
    ctrl.details = {
      objectMeta: {
        namespace: 'foo-namespace',
        name: 'foo-name',
      },
      podInfo: {
        current: 3,
        desired: 3,
      },
    };
    spyOn(kdReplicationControllerService, 'showUpdateReplicasDialog');

    // when
    ctrl.handleUpdateReplicasDialog();

    // then
    expect(kdReplicationControllerService.showUpdateReplicasDialog).toHaveBeenCalled();
  });
});
