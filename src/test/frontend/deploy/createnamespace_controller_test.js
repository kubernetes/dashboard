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

import NamespaceDialogController from 'deploy/createnamespace_controller';
import deployModule from 'deploy/deploy_module';

describe('Deploy controller', () => {
  let ctrl;

  beforeEach(() => {
    angular.mock.module(deployModule.name);

    angular.mock.inject(($mdDialog, $resource, $log) => {
      ctrl = new NamespaceDialogController($mdDialog, $resource, $log, []);
    });
  });

  it('should return true if namespace is empty', () => {
    // when
    let result = ctrl.isDisabled();

    // then
    expect(result).toBeTruthy();
  });

  it('should return true if namespace already exists', () => {
    // given
    ctrl.namespaces = ['test'];
    ctrl.namespace = 'test';

    // when
    let result = ctrl.isDisabled();

    // then
    expect(result).toBeTruthy();
  });

  it('should return false if namespace not empty and not exist', () => {
    // given
    ctrl.namespace = 'test';

    // when
    let result = ctrl.isDisabled();

    // then
    expect(result).toBeFalsy();
  });
});
