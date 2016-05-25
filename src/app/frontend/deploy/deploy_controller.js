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

import {stateName as replicationcontrollers} from 'replicationcontrollerlist/replicationcontrollerlist_state';

/**
 * Controller for the deploy view.
 *
 * @final
 */
export default class DeployController {
  /**
   * @param {!ui.router.$state} $state
   * @param {!backendApi.NamespaceList} namespaces
   * @param {!backendApi.Protocols} protocols
   * @ngInject
   */
  constructor($state, namespaces, protocols) {
    /** @export {!angular.FormController} Initialized from the template */
    this.deployForm;

    /**
     * List of available namespaces.
     * TODO(bryk): Move this to deploy from settings directive. E.g., use activate method when
     * switching to Angular 1.5.
     * @export {!Array<string>}
     */
    this.namespaces = namespaces.namespaces;

    /** @export {!Array<string>} */
    this.protocols = protocols.protocols;

    /**
     * Contains the selected directive's controller which has its own deploy logic
     *
     * Initialized from the template.
     * @export {{deploy:function()}|undefined}
     */
    this.detail;

    /**
     * Child directive selection model. The list of possible values is in template. This value
     * represents the default selection.
     * @export {string}
     */
    this.selection = 'Settings';

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @private {boolean} */
    this.isDeployInProgress_ = false;

    /**
     * @export
     * {!Object}
     */
    this.i18n = i18n;
  }

  /**
   * Notifies the child scopes to call their deploy methods.
   * @export
   */
  deployBySelection() {
    if (this.deployForm.$valid) {
      this.isDeployInProgress_ = true;
      this.detail.deploy().finally(() => { this.isDeployInProgress_ = false; });
    }
  }

  /**
   * Returns true when the deploy action should be enabled.
   * @return {boolean}
   * @export
   */
  isDeployDisabled() { return this.isDeployInProgress_ || !this.detail; }

  /**
   * Cancels the deployment form.
   * @export
   */
  cancel() { this.state_.go(replicationcontrollers); }
}

const i18n = {
    /** @export {string} @desc Title text which appears on top of the deploy page. */
    MSG_DEPLOY_PAGE_TITLE : goog.getMsg('Deploy a Containerized App'),

    /** @export {string} @desc Text for a selection option, which the user must click to manually enter the app details on the deploy page. */
    MSG_DEPLOY_SPECIFY_APP_DETAILS_ACTION : goog.getMsg('Specify app details below'),

    /** @export {string} @desc Text for a selection option, which the user must click to upload a YAML/JSON file to deploy from on the deploy page. */
    MSG_DEPLOY_FILE_UPLOAD_ACTION : goog.getMsg('Upload a YAML or JSON file'),

    /** @export {string} @desc The text is put on the 'Deploy' button at the end of the deploy page. */
    MSG_DEPLOY_DEPLOY_ACTION : goog.getMsg('Deploy'),

    /** @export {string} @desc The text is put on the 'Cancel' button at the end of the deploy page. */
    MSG_DEPLOY_CANCEL_ACTION : goog.getMsg('Cancel'),
};
