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

import {StorageController} from 'storage/controller';
import storageListModule from 'storage/module';

describe('Storage list controller', () => {
  /** @type {!storage/controller.StorageController} */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(storageListModule.name);

    angular.mock.inject(($controller) => {
      ctrl = $controller(StorageController, {storage: {storage: []}});
    });
  });

  it('should initialize storage', angular.mock.inject(($controller) => {
    let storage = {storage: 'foo-bar'};
    /** @type {!StorageController} */
    let ctrl = $controller(StorageController, {storage: storage});

    expect(ctrl.storage).toBe(storage);
  }));

  it('should show zero state', () => {
    // given
    ctrl.storage = {
      persistentVolumeClaimList: {listMeta: {totalItems: 0}, persistentVolumeClaims: []},
    };

    expect(ctrl.shouldShowZeroState()).toBeTruthy();
  });

  it('should hide zero state', () => {
    // given
    ctrl.storage = {
      persistentVolumeClaimList: {listMeta: {totalItems: 1}, persistentVolumeClaims: []},
    };

    // then
    expect(ctrl.shouldShowZeroState()).toBeFalsy();
  });
});
