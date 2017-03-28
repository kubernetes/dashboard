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

import {DiscoveryController} from 'discovery/controller';
import module from 'discovery/module';

describe('Discovery list controller', () => {
  /** @type {!discovery/discovery_controller.DiscoveryController}
   */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(module.name);

    angular.mock.inject(($controller) => {
      ctrl = $controller(
          DiscoveryController, {Discovery: {Discovery: []}});
    });
  });

  it('should initialize Discovery', angular.mock.inject(($controller) => {
    let Discovery = {Discovery: 'foo-bar'};
    /** @type {!DiscoveryController} */
    let ctrl =
        $controller(DiscoveryController, {Discovery: Discovery});

    expect(ctrl.Discovery).toBe(Discovery);
  }));

  it('should show zero state', () => {
    // given
    ctrl.Discovery = {
      serviceList: {listMeta: {totalItems: 0}},
      ingressList: {listMeta: {totalItems: 0}},
    };

    expect(ctrl.shouldShowZeroState()).toBe(true);
  });

  it('should hide zero state', () => {
    // given
    ctrl.Discovery = {
      serviceList: {listMeta: {totalItems: 0}},
      ingressList: {listMeta: {totalItems: 1}},
    };

    // then
    expect(ctrl.shouldShowZeroState()).toBe(false);
  });
});
