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

import {DeploymentListController} from 'deploymentlist/deploymentlist_controller';
import deploymentListModule from 'deploymentlist/deploymentlist_module';

describe('Replica Set list controller', () => {
  /** @type {!deploymentlist/deploymentlist_controller.DeploymentListController} */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(deploymentListModule.name);

    angular.mock.inject(($controller) => {
      ctrl = $controller(DeploymentListController, {deploymentList: {deployments: []}});
    });
  });

  it('should initialize replication controllers', angular.mock.inject(($controller) => {
    let ctrls = {};
    /** @type {!DeploymentListController} */
    let ctrl = $controller(DeploymentListController, {deploymentList: {deployments: ctrls}});

    expect(ctrl.deploymentList.deployments).toBe(ctrls);
  }));

  it('should show zero state', () => {
    expect(ctrl.shouldShowZeroState()).toBeTruthy();
  });

  it('should hide zero state', () => {
    // given
    ctrl.deploymentList = {deployments: ['mock']};

    // then
    expect(ctrl.shouldShowZeroState()).toBeFalsy();
  });
});
