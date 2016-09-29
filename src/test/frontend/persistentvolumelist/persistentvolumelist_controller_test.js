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

import {PersistentVolumeListController} from 'persistentvolumelist/persistentvolumelist_controller';
import persistentVolumeListModule from 'persistentvolumelist/persistentvolumelist_module';

describe('Persistent Volume list controller', () => {
  /** @type {!persistentvolumelist/persistentvolumelist_controller.PersistentVolumeListController}
   */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(persistentVolumeListModule.name);

    angular.mock.inject(($controller) => {
      ctrl = $controller(PersistentVolumeListController, {persistentVolumeList: {items: []}});
    });
  });

  it('should initialize persistent volume controller', angular.mock.inject(($controller) => {
    let ctrls = {};
    /** @type {!PersistentVolumeListController} */
    let ctrl = $controller(PersistentVolumeListController, {persistentVolumeList: {items: ctrls}});

    expect(ctrl.persistentVolumeList.items).toBe(ctrls);
  }));

  it('should show zero state', () => {
    expect(ctrl.shouldShowZeroState()).toBe(true);
  });

  it('should hide zero state', () => {
    // given
    ctrl.persistentVolumeList = {items: ['mock']};

    // then
    expect(ctrl.shouldShowZeroState()).toBe(false);
  });
});
