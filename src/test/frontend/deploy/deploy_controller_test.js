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

import DeployController from 'deploy/deploy_controller';
import deployModule from 'deploy/deploy_module';

describe('Deploy controller', () => {
  /** @type {!DeployController} */
  let ctrl;
  /** @type {!ui.router.$state} */
  let state;

  beforeEach(() => {
    angular.mock.module(deployModule.name);

    angular.mock.inject(($controller, $state) => {
      state = $state;
      state.current.name = 'current-state';
      spyOn(state, 'go');
      ctrl = $controller(DeployController);
    });
  });

  it('should change selection', () => {
    expect(ctrl.selection).toBe('current-state');

    ctrl.changeSelection();

    expect(state.go).toHaveBeenCalledWith('current-state');
  });
});
