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

import {DiscoveryController} from 'discovery/controller';
import module from 'discovery/module';

describe('Discovery list controller', () => {
  /**
   * @type {!DiscoveryController}
   */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(module.name);

    angular.mock.inject(($controller) => {
      ctrl = $controller(DiscoveryController, {discovery: {discovery: []}});
    });
  });

  it('should initialize Discovery', angular.mock.inject(($controller) => {
    let discovery = {discovery: 'foo-bar'};
    /** @type {!DiscoveryController} */
    let ctrl = $controller(DiscoveryController, {discovery: discovery});

    expect(ctrl.discovery).toBe(discovery);
  }));

  it('should show zero state', () => {
    // given
    ctrl.discovery = {
      serviceList: {listMeta: {totalItems: 0}},
      ingressList: {listMeta: {totalItems: 0}},
    };

    expect(ctrl.shouldShowZeroState()).toBe(true);
  });

  it('should hide zero state', () => {
    // given
    ctrl.discovery = {
      serviceList: {listMeta: {totalItems: 0}},
      ingressList: {listMeta: {totalItems: 1}},
    };

    // then
    expect(ctrl.shouldShowZeroState()).toBe(false);
  });
});
