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

import {ConfigController} from 'config/controller';
import module from 'config/module';

describe('Config list controller', () => {
  /** @type {!ConfigController} */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(module.name);

    angular.mock.inject(($controller) => {
      ctrl = $controller(ConfigController, {config: {config: []}});
    });
  });

  it('should initialize config', angular.mock.inject(($controller) => {
    let config = {config: 'foo-bar'};
    /** @type {!ConfigController} */
    let ctrl = $controller(ConfigController, {config: config});

    expect(ctrl.config).toBe(config);
  }));

  it('should show zero state', () => {
    // given
    ctrl.config = {
      secretList: {listMeta: {totalItems: 0}},
      configMapList: {listMeta: {totalItems: 0}},
      persistentVolumeClaimList: {listMeta: {totalItems: 0}},
    };

    expect(ctrl.shouldShowZeroState()).toBe(true);
  });

  it('should hide zero state', () => {
    // given
    ctrl.config = {
      secretList: {listMeta: {totalItems: 0}},
      configMapList: {listMeta: {totalItems: 1}},
      persistentVolumeClaimList: {listMeta: {totalItems: 0}},
    };

    // then
    expect(ctrl.shouldShowZeroState()).toBe(false);
  });
});
