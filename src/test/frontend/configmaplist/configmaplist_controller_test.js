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

import {ConfigMapListController} from 'configmaplist/configmaplist_controller';
import configMapListModule from 'configmaplist/configmaplist_module';

describe('Config Map list controller', () => {
  /** @type {!configmaplist/configmaplist_controller.ConfigMapListController} */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(configMapListModule.name);

    angular.mock.inject(($controller) => {
      ctrl = $controller(ConfigMapListController, {configMapList: {items: []}});
    });
  });

  it('should initialize config map controller', angular.mock.inject(($controller) => {
    let ctrls = {};
    /** @type {!ConfigMapListController} */
    let ctrl = $controller(ConfigMapListController, {configMapList: {items: ctrls}});

    expect(ctrl.configMapList.items).toBe(ctrls);
  }));

  it('should show zero state', () => {
    expect(ctrl.shouldShowZeroState()).toBe(true);
  });

  it('should hide zero state', () => {
    // given
    ctrl.configMapList = {items: ['mock']};

    // then
    expect(ctrl.shouldShowZeroState()).toBe(false);
  });
});
