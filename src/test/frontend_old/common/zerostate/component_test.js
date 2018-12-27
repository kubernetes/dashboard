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
import {stateName as deployAppStateName} from 'deploy/state';

describe('Zero state', () => {
  /** @type {!Object} */
  let transclude;
  /** @type {!angular.$state} */
  let state;
  /** @type {!ZeroStateController} */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(componentsModule.name);
    angular.mock.inject(($state, $componentController) => {
      state = $state;
      transclude = {isSlotFilled: () => {}};

      ctrl = $componentController('kdZeroState', {$state: state, $transclude: transclude});
    });
  });

  it('should get deploy state href', () => {
    // given
    spyOn(state, 'href');

    // when
    ctrl.getStateHref();

    // then
    expect(state.href).toHaveBeenCalledWith(deployAppStateName);
  });

  it('should hide default zerostate when any slot is filled', () => {
    // given
    spyOn(transclude, 'isSlotFilled').and.returnValue(true);

    // when
    let result = ctrl.showDefaultZerostate();

    // then
    expect(result).toBeFalsy();
  });

  it('should show default zerostate when slots are not filled', () => {
    // given
    spyOn(transclude, 'isSlotFilled').and.returnValue(false);

    // when
    let result = ctrl.showDefaultZerostate();

    // then
    expect(result).toBeTruthy();
  });
});
