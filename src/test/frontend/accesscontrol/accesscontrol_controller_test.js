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

import {AccessControlController} from 'accesscontrol/controller';
import accessControlModule from 'accesscontrol/module';

describe('Access control controller', () => {
  /** @type {!accesscontrol/controller.AccessControlController}
   */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(accessControlModule.name);

    angular.mock.inject(($controller) => {
      ctrl = $controller(AccessControlController, {roleList: {items: []}});
    });
  });

  it('should initialize access control controller', angular.mock.inject(($controller) => {
    let ctrls = {};
    /** @type {!AccessControlController} */
    let ctrl = $controller(AccessControlController, {roleList: {items: ctrls}});

    expect(ctrl.roleList.items).toBe(ctrls);
  }));

  it('should show zero state', () => {
    expect(ctrl.shouldShowZeroState()).toBe(true);
  });

  it('should hide zero state', () => {
    // given
    ctrl.roleList = {items: ['mock']};

    // then
    expect(ctrl.shouldShowZeroState()).toBe(false);
  });

  it('should show zero state if returned items is null', () => {
    // given
    ctrl.roleList = {items: null};

    // then
    expect(ctrl.shouldShowZeroState()).toBe(true);
  });
});
