// Copyright 2015 Google Inc. All Rights Reserved.
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

import {HorizontalPodAutoscalerDetailController} from 'horizontalpodautoscalerdetail/horizontalpodautoscalerdetail_controller';
import horizontalPodAutoscalerDetailModule from 'horizontalpodautoscalerdetail/horizontalpodautoscalerdetail_module';

describe('Horizontal Pod Autoscaler Detail controller', () => {

  beforeEach(() => {
    angular.mock.module(horizontalPodAutoscalerDetailModule.name);
  });

  it('should initialize horizontal pod autoscaler controller',
     angular.mock.inject(($controller) => {
       let data = {};
       /** @type {!HorizontalPodAutoscalerDetailController} */
       let ctrl = $controller(
           HorizontalPodAutoscalerDetailController, {horizontalPodAutoscalerDetail: data});

       expect(ctrl.horizontalPodAutoscalerDetail).toBe(data);
     }));
});
