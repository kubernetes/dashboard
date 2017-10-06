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

import {ReplicationControllerListController} from 'replicationcontroller/list/controller';
import replicationControllerModule from 'replicationcontroller/module';

describe('Replication controller list controller', () => {

  beforeEach(() => {
    angular.mock.module(replicationControllerModule.name);
  });

  it('should initialize replication controller list', angular.mock.inject(($controller) => {
    let ctrls = {};
    /** @type {!ReplicationControllerListController} */
    let ctrl = $controller(
        ReplicationControllerListController,
        {replicationControllerList: {replicationControllers: ctrls}});

    expect(ctrl.replicationControllerList.replicationControllers).toBe(ctrls);
  }));
});
