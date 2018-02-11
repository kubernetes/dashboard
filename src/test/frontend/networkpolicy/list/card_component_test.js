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

import networkPolicyModule from 'networkpolicy/module';

describe('Network Policy card', () => {
  /** @type {!NetworkPolicyCardController} */
  let ctrl;
  /**
   * @type {!NamespaceService}
   */
  let data;

  beforeEach(() => {
    angular.mock.module(networkPolicyModule.name);

    angular.mock.inject(($componentController, $rootScope ,kdNamespaceService) => {
      /** @type {!NamespaceService} */
      data = kdNamespaceService;

      ctrl = $componentController('kdNetworkPolicyCard', {$scope: $rootScope , kdNamespaceService_: data}, {});
    });
  });

  it('should get details href', () => {
    ctrl.networkPolicy = {
        objectMeta: {
          namespace: 'foo',
          name: 'bar',
        },
    };
    expect(ctrl.getNetworkPolicyDetailHref()).toBe('#!/networkpolicy/foo/bar');
  });
});
