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

describe('Horizontal Pod Autoscaler card list', () => {
  /** @type {!HorizontalPodAutoscalerCardListController} */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(horizontalPodAutoscalerModule.name);

    angular.mock.inject(($componentController, $rootScope) => {
      /** @type {!HorizontalPodAutoscalerCardListController} */
      ctrl = $componentController('kdHorizontalPodAutoscalerCardList', {$scope: $rootScope}, {});
    });
  });

  it('should instantiate the controller properly', () => {
    expect(ctrl).not.toBeUndefined();
  });

  it('should return correct select id', () => {
    // given
    let expected = 'hpas';
    ctrl.horizontalPodAutoscalerList = {};
    ctrl.horizontalPodAutoscalerListResource = {};

    // when
    let got = ctrl.getSelectId();

    // then
    expect(got).toBe(expected);
  });

  it('should return empty select id', () => {
    // given
    let expected = '';

    // when
    let got = ctrl.getSelectId();

    // then
    expect(got).toBe(expected);
  });
});
