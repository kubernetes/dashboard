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

import logModule from 'logs/module';
import podModule from 'pod/module';

describe('Pod Info controller', () => {
  /**
   * Pod Info controller.
   * @type {!PodInfoController}
   */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(podModule.name);
    angular.mock.module(logModule.name);

    angular.mock.inject(($componentController, $rootScope, $state) => {
      ctrl = $componentController('kdPodInfo', {$scope: $rootScope}, {
        pod: {
          objectMeta: {
            name: 'my-pod',
            namespace: 'default-ns',
          },
        },
        state_: $state,
      });
    });
  });

  it('should instantiate the controller properly', () => {
    expect(ctrl).not.toBeUndefined();
  });
});
