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

import secretModule from 'secret/module';

describe('Secret card', () => {
  /**
   * @type {!SecretCardController}
   */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(secretModule.name);

    angular.mock.inject(($componentController, $rootScope) => {
      ctrl = $componentController('kdSecretCard', {$scope: $rootScope}, {});
    });
  });

  it('should handle multiple namespaces', () => {
    expect(ctrl.areMultipleNamespacesSelected()).toBe(false);
    spyOn(ctrl.kdNamespaceService_, 'areMultipleNamespacesSelected').and.returnValue(true);
    expect(ctrl.areMultipleNamespacesSelected()).toBe(true);
  });
});
