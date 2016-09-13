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

import {ServicesAndDiscoveryController} from 'servicesanddiscovery/controller';
import module from 'servicesanddiscovery/module';

describe('ServicesAndDiscovery list controller', () => {
  /** @type {!servicesanddiscovery/servicesanddiscovery_controller.ServicesAndDiscoveryController}
   */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(module.name);

    angular.mock.inject(($controller) => {
      ctrl = $controller(
          ServicesAndDiscoveryController, {servicesAndDiscovery: {servicesAndDiscovery: []}});
    });
  });

  it('should initialize servicesAndDiscovery', angular.mock.inject(($controller) => {
    let servicesAndDiscovery = {servicesAndDiscovery: 'foo-bar'};
    /** @type {!ServicesAndDiscoveryController} */
    let ctrl =
        $controller(ServicesAndDiscoveryController, {servicesAndDiscovery: servicesAndDiscovery});

    expect(ctrl.servicesAndDiscovery).toBe(servicesAndDiscovery);
  }));

  it('should show zero state', () => {
    // given
    ctrl.servicesAndDiscovery = {
      serviceList: {listMeta: {totalItems: 0}},
      ingressList: {listMeta: {totalItems: 0}},
    };

    expect(ctrl.shouldShowZeroState()).toBe(true);
  });

  it('should hide zero state', () => {
    // given
    ctrl.servicesAndDiscovery = {
      serviceList: {listMeta: {totalItems: 0}},
      ingressList: {listMeta: {totalItems: 1}},
    };

    // then
    expect(ctrl.shouldShowZeroState()).toBe(false);
  });
});
