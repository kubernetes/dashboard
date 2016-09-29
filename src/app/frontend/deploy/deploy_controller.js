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

import {deployAppStateName, deployFileStateName} from './deploy_state';

/**
 * Controller for the deploy view.
 *
 * @final
 */
export default class DeployController {
  /**
   * @param {!ui.router.$state} $state
   * @ngInject
   */
  constructor($state) {
    /** @export {string} */
    this.selection = $state.current.name;

    /** @export {string} */
    this.appOption = deployAppStateName;

    /** @export {string} */
    this.fileOption = deployFileStateName;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @export */
    this.i18n = i18n;
  }

  /** @export */
  changeSelection() {
    this.state_.go(this.selection);
  }
}

const i18n = {
  /** @export {string} @desc Title text which appears on top of the deploy page. */
  MSG_DEPLOY_PAGE_TITLE: goog.getMsg('Deploy a Containerized App'),

  /** @export {string} @desc Text for a selection option, which the user must click to manually
     enter the app details on the deploy page. */
  MSG_DEPLOY_SPECIFY_APP_DETAILS_ACTION: goog.getMsg('Specify app details below'),

  /** @export {string} @desc Text for a selection option, which the user must click to upload a
     YAML/JSON file to deploy from on the deploy page. */
  MSG_DEPLOY_FILE_UPLOAD_ACTION: goog.getMsg('Upload a YAML or JSON file'),

  /** @export {string} @desc User help with a link redirecting to the "Dashboard tour" on the
     deploy page. */
  MSG_DEPLOY_DASHBOARD_TOUR_USER_HELP:
      goog.getMsg(`To learn more, {$openLink} take the Dashboard Tour {$linkIcon} {$closeLink}`, {
        'openLink':
            `<a href="http://kubernetes.io/docs/user-guide/ui/" target="_blank" tabindex="-1">`,
        'closeLink': `</a>`,
        'linkIcon': `<i class="material-icons">open_in_new</i>`,
      }),
};
