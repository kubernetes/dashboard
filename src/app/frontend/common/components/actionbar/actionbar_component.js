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

import {actionbarViewName} from 'chrome/chrome_state';
import {deployAppStateName} from 'deploy/deploy_state';

/**
 * @final
 */
export class ActionbarComponent {
  /**
   * @param {!ui.router.$state} $state
   * @ngInject
   */
  constructor($state) {
    /** @private {!ui.router.$state} */
    this.state_ = $state;
  }

  /**
   * @return {boolean}
   * @export
   */
  hasCustomActions() {
    return !!this.state_.current.views && !!this.state_.current.views[actionbarViewName];
  }

  /**
   * @export
   */
  create() {
    this.state_.go(deployAppStateName);
  }
}

/**
 * @type {!angular.Component}
 */
export const actionbarComponent = {
  templateUrl: 'common/components/actionbar/actionbar.html',
  transclude: true,
  controller: ActionbarComponent,
};
