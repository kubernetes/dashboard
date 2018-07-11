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

import resourceCardModule from 'common/components/resourcecard/resourcecard_module';

describe('Suspend resource menu item', () => {
  /** @type {!ResourceCardSuspendMenuItemController} */
  let ctrl;
  let q;
  let scope;
  let kdSuspendService;
  beforeEach(() => {
    angular.mock.module(resourceCardModule.name);
    angular.mock.inject(($rootScope, $componentController, $q, _kdSuspendService_) => {
      kdSuspendService = _kdSuspendService_;
      scope = $rootScope;
      ctrl = $componentController('kdResourceCardSuspendMenuItem', {$scope: $rootScope});
      q = $q;
    });
  });

  it('should suspend the resource', () => {
    let deferred = q.defer();
    let httpStatusOk = 200;
    spyOn(kdSuspendService, 'disable').and.returnValue(deferred.promise);
    ctrl.disable();

    deferred.resolve(httpStatusOk);
    scope.$digest();
  });

  it('should unsuspend the resource', () => {
    let deferred = q.defer();
    let httpStatusOk = 200;
    spyOn(kdSuspendService, 'enable').and.returnValue(deferred.promise);
    ctrl.enable();

    deferred.resolve(httpStatusOk);
    scope.$digest();
  });
});
