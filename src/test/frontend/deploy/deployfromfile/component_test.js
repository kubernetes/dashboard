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

import deployModule from 'deploy/module';

describe('DeployFromFile controller', () => {
  /** @type {!DeployFromFileController} */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(deployModule.name);

    angular.mock.inject(($componentController, $resource, $mdDialog, _kdHistoryService_) => {
      ctrl = $componentController('kdDeployFromFile', {historyService_: _kdHistoryService_});
    });
  });

  it('should cancel', () => {
    spyOn(ctrl.historyService_, 'back');
    ctrl.cancel();
    expect(ctrl.historyService_.back).toHaveBeenCalled();
  });
});
