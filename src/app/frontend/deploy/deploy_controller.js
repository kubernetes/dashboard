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

import {stateName as zerostate} from 'zerostate/zerostate_state';
import showNamespaceDialog from 'deploy/createnamespace_dialog';

/**
 * Controller for the deploy view.
 *
 * @final
 */
export default class DeployController {
  /**
   * @param {!angular.$resource} $resource
   * @param {!angular.$log} $log
   * @param {!ui.router.$state} $state
   * @param {!md.$dialog} $mdDialog
   * @param {!backendApi.NamespaceList} namespaces
   * @ngInject
   */
  constructor($resource, $log, $state, $mdDialog, namespaces) {
    /** @export {!angular.FormController} Initialized from the template */
    this.deployForm;

    /** @export {string} */
    this.name = '';

    /**
     * List of available namespaces.
     * @export {!Array<string>}
     */
    this.namespaces = namespaces.namespaces;

    /**
     * Currently chosen namespace.
     * @export {(string|undefined)}
     */
    this.namespace = this.namespaces.length > 0 ? this.namespaces[0] : undefined;

    /** @private {!angular.$resource} */
    this.resource_ = $resource;

    /** @private {!angular.$log} */
    this.log_ = $log;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @private {!md.$dialog} */
    this.mdDialog_ = $mdDialog;

    /** @private {boolean} */
    this.isDeployInProgress_ = false;

    /**
     * Contains the selected directive's controller which has its own deploy logic
     *
     * @export {{deploy:function()}}
     */
    this.detail = {deploy: function() {}};

    /**
     * Child directive selection model. The list of possible values is in template. This value
     * represents the default selection.
     * @export {string}
     */
    this.selection = "Settings";
  }

  /**
   * Notifies the child scopes to call their deploy methods.
   *
   * @export
   */
  deployBySelection() {
    this.isDeployInProgress_ = true;
    this.detail.deploy().finally(() => { this.isDeployInProgress_ = false; });
  }

  /**
   * Displays new namespace creation dialog.
   *
   * @param {!angular.Scope.Event} event
   */
  handleNamespaceDialog(event) {
    showNamespaceDialog(this.mdDialog_, event, this.namespaces)
        .then(
            /**
             * Handles namespace dialog result. If namespace was created successfully then it
             * will be selected, otherwise first namespace will be selected.
             *
             * @param {string|undefined} answer
             */
            (answer) => {
              if (answer) {
                this.namespace = answer;
                this.namespaces = this.namespaces.concat(answer);
              } else {
                this.namespace = this.namespaces[0];
              }
            },
            () => { this.namespace = this.namespaces[0]; });
  }

  /**
   * Returns true when the deploy action should be enabled.
   * @return {boolean}
   * @export
   */
  isDeployDisabled() { return this.isDeployInProgress_ || this.deployForm.$invalid; }

  /**
   * Cancels the deployment form.
   * @export
   */
  cancel() { this.state_.go(zerostate); }
}
