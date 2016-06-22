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

import {deployAppStateName} from 'deploy/deploy_state';

/**
 * @final
 */
export class ZeroStateController {
  /**
   * @param {!ui.router.$state} $state
   * @ngInject
   */
  constructor($state) {
    /** @export */
    this.i18n = i18n($state);
  }
}

/**
 * @return {!angular.Component}
 */
export const zeroStateComponent = {
  templateUrl: 'common/components/zerostate/zerostate.html',
  transclude: true,
  controller: ZeroStateController,
};

/**
 * @param {!ui.router.$state} $state
 */
let i18n = ($state) => ({
  /** @export {string} @desc Title text which appears on zero state view. */
  MSG_ZERO_STATE_TITLE: goog.getMsg('There is nothing to display here'),
  /** @export {string} @desc Text which appears on zero state view under the title. It provides
   *  to deploy view or offers user to take the Dashboard Tour. */
  MSG_ZERO_STATE_TEXT: goog.getMsg(
      'You can {$createNewLink}deploy a containerized app{$createNewCloseLink},' +
          ' select other namespace or {$openLink}take the Dashboard Tour {$linkIcon}{$closeLink}' +
          ' to learn more',
      {
        'createNewLink': `<a href="${$state.href(deployAppStateName)}">`,
        'createNewCloseLink': `</a>`,
        'openLink': `<a href="http://kubernetes.io/docs/user-guide/ui/" target="_blank">`,
        'linkIcon': `<i class="material-icons kd-zerostate-icon">open_in_new</i>`,
        'closeLink': `</a>`,
      }),
});
