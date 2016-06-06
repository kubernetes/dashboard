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

import {stateName as deploy} from 'deploy/deploy_state';

/**
 * @final
 */
export class PodListActionBarController {
  /**
   * @param {!ui.router.$state} $state
   * @ngInject
   */
  constructor($state) {
    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @export */
    this.i18n = i18n;
  }

  /**
   * @export
   */
  redirectToDeployPage() { this.state_.go(deploy); }
}

const i18n = {
  /** @export {string} @desc Tooltip 'Deploy a containerized app' which appears on the pod list
     page when you hover over the '+' button at the action bar.*/
  MSG_POD_LIST_ACTION_BAR_DEPLOY_TOOLTIP: goog.getMsg('Deploy a containerized app'),
};
