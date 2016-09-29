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

import {SecretListController} from 'secretlist/list_controller';
import secretListModule from 'secretlist/module';

describe('Secret list controller', () => {
  /** @type {!secretlist/secretlist_controller.SecretListController} */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(secretListModule.name);

    angular.mock.inject(($controller) => {
      ctrl = $controller(SecretListController, {secretList: {secrets: []}});
    });
  });

  it('should initialize secret list', angular.mock.inject(($controller) => {
    let data = {secrets: []};
    /** @type {!SecretListController} */
    let ctrl = $controller(SecretListController, {secretList: data});

    expect(ctrl.secretList).toBe(data);
  }));

  it('should show zero state', () => {
    expect(ctrl.shouldShowZeroState()).toBeTruthy();
  });

  it('should hide zero state', () => {
    // given
    ctrl.secretList = {secrets: ['mock']};

    // then
    expect(ctrl.shouldShowZeroState()).toBeFalsy();
  });
});
