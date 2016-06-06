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

import {
  ReplicationControllerDetailActionBarController,
} from 'replicationcontrollerdetail/replicationcontrollerdetailactionbar_controller';
import replicationControllerDetailModule from 'replicationcontrollerdetail/replicationcontrollerdetail_module';
import {stateName as deploy} from 'deploy/deploy_state';

describe('Replication Controller Detail Action Bar controller', () => {
  /**
   * Replication Controller Detail Action Bar controller.
   * @type {!ReplicationControllerDetailActionBarController}
   */
  let ctrl;
  /** @type
   * {!replicationcontrollerdetail/replicationcontroller_service.ReplicationControllerService} */
  let kdReplicationControllerService;
  /** @type {!ui.router.$state} */
  let state;

  beforeEach(() => {
    angular.mock.module(replicationControllerDetailModule.name);

    angular.mock.inject(($controller, $state, $resource, _kdReplicationControllerService_) => {
      state = $state;
      kdReplicationControllerService = _kdReplicationControllerService_;

      ctrl = $controller(ReplicationControllerDetailActionBarController, {
        $state: state,
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

  it('should redirect to deploy page', () => {
    // given
    spyOn(state, 'go');

    // when
    ctrl.redirectToDeployPage();

    // then
    expect(state.go).toHaveBeenCalledWith(deploy);
  });

  it('should show icons', () => {
    // given
    ctrl.showFabIcons = false;

    // when
    ctrl.showIcons();

    // then
    expect(ctrl.showFabIcons).toBeTruthy();
  });

  it('should hide icons', () => {
    // given
    ctrl.showFabIcons = true;

    // when
    ctrl.hideIcons();

    // then
    expect(ctrl.showFabIcons).toBeFalsy();
  });
});
