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

import {PersistentVolumeClaimListController} from 'persistentvolumeclaim/list/controller';
import persistentVolumeClaimModule from 'persistentvolumeclaim/module';

describe('Persistent Volume list controller', () => {

  beforeEach(() => {
    angular.mock.module(persistentVolumeClaimModule.name);
  });

  it('should initialize persistent volume claim controller', angular.mock.inject(($controller) => {
    let ctrls = {};
    /** @type {!PersistentVolumeClaimListController} */
    let ctrl = $controller(
        PersistentVolumeClaimListController, {persistentVolumeClaimList: {items: ctrls}});

    expect(ctrl.persistentVolumeClaimList.items).toBe(ctrls);
  }));
});
