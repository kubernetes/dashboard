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

import limitRangesModule from 'resourcelimit/module';

describe('Resource Limits controller', () => {
  /** @type {!ResourceLimitsController} */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(limitRangesModule.name);

    angular.mock.inject(($componentController, $rootScope) => {
      ctrl = $componentController('kdResourceLimits', {$scope: $rootScope}, {
        resourceLimits: {
          'Container': {
            'cpu': {
              'min': '100m',
              'max': '2',
              'default': '300m',
              'defaultRequest': '200m',
            },
            'memory': {
              'min': '3Mi',
              'max': '1Gi',
              'default': '200Mi',
              'defaultRequest': '100Mi',
            },
          },
        },
      });
    });
  });

  it('should initialize the ctrl', () => {
    expect(ctrl.resourceLimits).toBeDefined();
  });
});
