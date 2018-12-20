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

import {DeploymentListController} from 'deployment/list/controller';
import deploymentListModule from 'deployment/module';

describe('Deployment list controller', () => {
  beforeEach(() => {
    angular.mock.module(deploymentListModule.name);
  });

  it('should initialize replication controllers', angular.mock.inject(($controller) => {
    let ctrls = {};
    /** @type {!DeploymentListController} */
    let ctrl = $controller(DeploymentListController, {deploymentList: {deployments: ctrls}});

    expect(ctrl.deploymentList.deployments).toBe(ctrls);
  }));
});
