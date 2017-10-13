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

import horizontalPodAutoscalerModule from 'horizontalpodautoscaler/module';

describe('Horizontal Pod Autoscaler card', () => {
  /** @type {!HorizontalPodAutoscalerCardController} */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(horizontalPodAutoscalerModule.name);

    angular.mock.inject(($componentController, $rootScope) => {
      ctrl = $componentController('kdHorizontalPodAutoscalerCard', {$scope: $rootScope});
    });
    ctrl.horizontalPodAutoscaler = {
      objectMeta: {
        name: 'bar',
        namespace: 'test',
        creationTimestamp: '2016-06-06T09:13:12Z',
      },
    };
  });

  it('should get details href', () => {
    expect(ctrl.getHorizontalPodAutoscalerDetailHref()).toBe('#!/horizontalpodautoscaler/test/bar');
  });
});
