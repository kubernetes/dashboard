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

import storageClassModule from 'storageclass/module';

describe('Storage Class Info controller', () => {
  /** @type {!StorageClassInfoController} */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(storageClassModule.name);

    angular.mock.inject(($componentController, $rootScope) => {
      ctrl = $componentController('kdStorageClassInfo', {$scope: $rootScope}, {storageClass: {}});
    });
  });

  it('should initialize the ctrl', () => {
    expect(ctrl.storageClass).not.toBeUndefined();
  });
});
