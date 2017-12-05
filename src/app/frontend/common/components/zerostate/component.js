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

import {stateName as deployAppStateName} from '../../../deploy/state';

const TITLE_SLOT = 'title';
const TEXT_SLOT = 'text';

/**
 * @final
 */
export class ZeroStateController {
  /**
   * @param {!ui.router.$state} $state
   * @param {!angular.$transclude} $transclude
   * @ngInject
   */
  constructor($state, $transclude) {
    /** @private {!ui.router.$state} */
    this.state_ = $state;
    /** @private {!angular.$transclude} */
    this.transclude_ = $transclude;
  }

  /**
   * @return {string}
   * @export
   */
  getStateHref() {
    return this.state_.href(deployAppStateName);
  }

  /**
   * @return {boolean}
   * @export
   */
  showDefaultZerostate() {
    return !this.transclude_.isSlotFilled(TITLE_SLOT) && !this.transclude_.isSlotFilled(TEXT_SLOT);
  }
}

/**
 * @return {!angular.Component}
 */
export const zeroStateComponent = {
  templateUrl: 'common/components/zerostate/zerostate.html',
  transclude: {
    [TITLE_SLOT]: '?kdZeroStateTitle',
    [TEXT_SLOT]: '?kdZeroStateText',
  },
  controller: ZeroStateController,
};
