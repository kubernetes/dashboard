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

import componentsModule from 'common/components/module';
import scalingModule from 'common/scaling/module';

describe('Scale button component', () => {
  /** @type {!ScaleButtonController} */
  let ctrl;
  /** @type {!ScaleService} */
  let kdScaleService;

  beforeEach(() => {
    angular.mock.module(componentsModule.name);
    angular.mock.module(scalingModule.name);

    angular.mock.inject(($componentController, _kdScaleService_) => {
      kdScaleService = _kdScaleService_;

      ctrl = $componentController('kdScaleButton', {
        kdScaleService: _kdScaleService_,
      });
    });
  });

  it('should show edit replicas dialog', () => {
    // given
    ctrl.objectMeta = {
      namespace: 'foo-namespace',
      name: 'foo-name',
    };
    ctrl.desiredPods = 3;
    ctrl.currentPods = 3;
    ctrl.resourceKindName = 'Replica Set';
    spyOn(kdScaleService, 'showScaleDialog');

    // when
    ctrl.handleScaleResourceDialog();

    // then
    expect(kdScaleService.showScaleDialog).toHaveBeenCalled();
  });

  it('should return true if menu button should be displayed within menu item', () => {
    // given
    ctrl.menuItem = true;

    // when
    let result = ctrl.isMenuItem();

    // then
    expect(result).toBeTruthy();
  });
});
