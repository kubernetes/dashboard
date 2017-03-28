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

import {ServiceListController} from 'service/list/controller';
import serviceModule from 'service/module';

describe('Service list controller', () => {
  /** @type {!ServiceListController} */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(serviceModule.name);

    angular.mock.inject(($controller) => {
      ctrl = $controller(ServiceListController, {serviceList: {services: []}});
    });
  });

  it('should initialize controller', angular.mock.inject(($controller) => {
    let data = {services: {}};
    /** @type {!ServiceListController} */
    let ctrl = $controller(ServiceListController, {serviceList: data});

    expect(ctrl.serviceList).toBe(data);
  }));

  it('should show zero state', () => {
    expect(ctrl.shouldShowZeroState()).toBeTruthy();
  });

  it('should hide zero state', () => {
    // given
    ctrl.serviceList = {services: ['mock']};

    // then
    expect(ctrl.shouldShowZeroState()).toBeFalsy();
  });
});
