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

import {IngressListController} from 'ingresslist/list_controller';
import ingressListModule from 'ingresslist/module';

describe('Ingress list controller', () => {
  /** @type {!ingresslist/ingresslist_controller.IngressListController} */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(ingressListModule.name);

    angular.mock.inject(($controller) => {
      ctrl = $controller(IngressListController, {ingressList: {ingresss: []}});
    });
  });

  it('should initialize ingress list', angular.mock.inject(($controller) => {
    let data = {items: []};
    /** @type {!IngressListController} */
    let ctrl = $controller(IngressListController, {ingressList: data});

    expect(ctrl.ingressList).toBe(data);
  }));

  it('should show zero state', () => {
    expect(ctrl.shouldShowZeroState()).toBeTruthy();
  });

  it('should hide zero state', () => {
    // given
    ctrl.ingressList = {items: ['mock']};

    // then
    expect(ctrl.shouldShowZeroState()).toBeFalsy();
  });
});
