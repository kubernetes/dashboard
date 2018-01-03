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

import LabelsController from 'common/components/labels/component';
import componentsModule from 'common/components/module';

describe('Labels controller', () => {
  /**
   * @type {!LabelsController}
   */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(componentsModule.name);
    angular.mock.inject(($controller) => {
      ctrl = $controller(LabelsController);
    });
  });

  it('should display correct number of labels', () => {
    // given
    ctrl.labels = {
      'label-1': 'value-1',
      'label-2': 'value-2',
      'label-3': 'value-3',
      'label-4': 'value-4',
      'label-5': 'value-5',
      'label-6': 'value-6',
      'label-7': 'value-7',
      'label-8': 'value-8',
      'label-9': 'value-9',
      'label-10': 'value-10',
    };

    expect(ctrl.isMoreAvailable()).toBe(true);
    expect(ctrl.isShowingAll()).toBe(false);
    expect(ctrl.isVisible(0)).toBe(true);
    expect(ctrl.isVisible(4)).toBe(true);
    expect(ctrl.isVisible(5)).toBe(false);

    // when
    ctrl.switchLabelsView();

    // then
    expect(ctrl.isShowingAll()).toBe(true);
    expect(ctrl.isVisible(0)).toBe(true);
    expect(ctrl.isVisible(7)).toBe(true);
    expect(ctrl.isVisible(8)).toBe(true);
  });

  it('should not display switch if there are less than 5 labels', () => {
    // given
    ctrl.labels = {
      'label-1': 'value-1',
      'label-2': 'value-2',
      'label-3': 'value-3',
      'label-4': 'value-4',
      'label-5': 'value-5',
    };

    // then
    expect(ctrl.isMoreAvailable()).toBe(false);
  });
});
