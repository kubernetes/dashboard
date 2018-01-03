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

import {HorizontalPodAutoscalerListController} from 'horizontalpodautoscaler/list/controller';
import horizontalPodAutoscalerModule from 'horizontalpodautoscaler/module';

describe('Horizontal Pod Autoscaler list controller', () => {
  /** @type {!HorizontalPodAutoscalerListController} */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(horizontalPodAutoscalerModule.name);

    angular.mock.inject(($controller) => {
      ctrl = $controller(
          HorizontalPodAutoscalerListController,
          {horizontalPodAutoscalerList: {horizontalpodautoscalers: []}});
    });
  });

  it('should initialize horizontal pod autoscaler controller',
     angular.mock.inject(($controller) => {
       let ctrls = {};
       /** @type {!HorizontalPodAutoscalerListController} */
       let ctrl = $controller(
           HorizontalPodAutoscalerListController,
           {horizontalPodAutoscalerList: {horizontalpodautoscalers: ctrls}});

       expect(ctrl.horizontalPodAutoscalerList.horizontalpodautoscalers).toBe(ctrls);
     }));

  it('should show zero state', () => {
    expect(ctrl.shouldShowZeroState()).toBe(true);
  });

  it('should hide zero state', () => {
    // given
    ctrl.horizontalPodAutoscalerList = {horizontalpodautoscalers: ['mock']};

    // then
    expect(ctrl.shouldShowZeroState()).toBe(false);
  });
});
