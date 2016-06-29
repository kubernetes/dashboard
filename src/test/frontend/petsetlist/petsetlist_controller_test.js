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

import {PetSetListController} from 'petsetlist/petsetlist_controller';
import petSetListModule from 'petsetlist/petsetlist_module';

describe('Pet Set list controller', () => {
  /** @type {!petsetlist/petsetlist_controller.PetSetListController} */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(petSetListModule.name);

    angular.mock.inject(($controller) => {
      ctrl = $controller(PetSetListController, {petSetList: {petSets: []}});
    });
  });

  it('should initialize pet set controller', angular.mock.inject(($controller) => {
    let ctrls = {};
    /** @type {!PetSetListController} */
    let ctrl = $controller(PetSetListController, {petSetList: {petSets: ctrls}});

    expect(ctrl.petSetList.petSets).toBe(ctrls);
  }));

  it('should show zero state', () => { expect(ctrl.shouldShowZeroState()).toBeTruthy(); });

  it('should hide zero state', () => {
    // given
    ctrl.petSetList = {petSets: ['mock']};

    // then
    expect(ctrl.shouldShowZeroState()).toBeFalsy();
  });
});
