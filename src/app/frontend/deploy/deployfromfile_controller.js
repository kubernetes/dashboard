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

import {stateName as workloads} from 'workloads/workloads_state';

import showDeployAnywayDialog from './deployanyway_dialog';

/**
 * Controller for the deploy from file directive.
 *
 * @final
 */
export default class DeployFromFileController {
  /**
   * @param {!angular.$log} $log
   * @param {!angular.$resource} $resource
   * @param {!angular.$q} $q
   * TODO (cheld) Set correct type after fixing issue #159
   * @param {!Object} errorDialog
   * @param {!./../common/history/history_service.HistoryService} kdHistoryService
   * @param {!md.$dialog} $mdDialog
   * @ngInject
   */
  constructor($log, $resource, $q, errorDialog, kdHistoryService, $mdDialog) {
    /**
     * Initialized the template.
     * @export {!angular.FormController}
     */
    this.form;

    /**
     * Custom file model for the selected file
     *
     * @export {{name:string, content:string}}
     */
    this.file = {name: '', content: ''};

    /** @private {!angular.$q} */
    this.q_ = $q;

    /** @private {!angular.$resource} */
    this.resource_ = $resource;

    /** @private {!angular.$log} */
    this.log_ = $log;

    /**
     * TODO (cheld) Set correct type after fixing issue #159
     * @private {!Object}
     */
    this.errorDialog_ = errorDialog;

    /** @private {boolean} */
    this.isDeployInProgress_ = false;

    /** @private {!./../common/history/history_service.HistoryService} */
    this.kdHistoryService_ = kdHistoryService;

    /** @private {!md.$dialog} */
    this.mdDialog_ = $mdDialog;

    /** @export */
    this.i18n = i18n;
  }

  /**
   * Deploys the application based on the state of the controller.
   *
   * @export
   */
  deploy(validate = true) {
    if (this.form.$valid) {
      /** @type {!backendApi.AppDeploymentFromFileSpec} */
      let deploymentSpec = {
        name: this.file.name,
        content: this.file.content,
        validate: validate,
      };

      let defer = this.q_.defer();

      /** @type {!angular.Resource<!backendApi.AppDeploymentFromFileSpec>} */
      let resource = this.resource_('api/v1/appdeploymentfromfile');
      this.isDeployInProgress_ = true;
      resource.save(
          deploymentSpec,
          (response) => {
            defer.resolve(response);  // Progress ends
            this.log_.info('Deployment is completed: ', response);
            if (response.error.length > 0) {
              this.errorDialog_.open('Deployment has been partly completed', response.error);
            }
            this.kdHistoryService_.back(workloads);
          },
          (err) => {
            defer.reject(err);  // Progress ends
            if (this.hasValidationError_(err.data)) {
              this.handleDeployAnywayDialog_(err.data);
            } else {
              this.log_.error('Error deploying application:', err);
              this.errorDialog_.open(this.i18n.MSG_DEPLOY_DIALOG_ERROR, err.data);
            }
          });
      defer.promise.finally(() => {
        this.isDeployInProgress_ = false;
      });
    }
  }

  /**
   * Returns true if given error contains information about validate=false argument, false otherwise.
   *
   * @param {string} err
   * @return {boolean}
   * @private
   */
  hasValidationError_(err) {
    return err.indexOf('validate=false') > -1;
  }

  /**
   * Handles deploy anyway dialog.
   *
   * @param {string} err
   * @private
   */
  handleDeployAnywayDialog_(err) {
    showDeployAnywayDialog(
        this.mdDialog_, this.i18n.MSG_DEPLOY_ANYWAY_DIALOG_TITLE,
        this.i18n.MSG_DEPLOY_ANYWAY_DIALOG_CONTENT, err, this.i18n.MSG_DEPLOY_ANYWAY_DIALOG_OK,
        this.i18n.MSG_DEPLOY_ANYWAY_DIALOG_CANCEL)
        .then(() => {
          this.deploy(false);
        });
  }

  /**
   * Returns true when the deploy action should be enabled.
   * @return {boolean}
   * @export
   */
  isDeployDisabled() {
    return this.isDeployInProgress_;
  }

  /**
   * Cancels the deployment form.
   * @export
   */
  cancel() {
    this.kdHistoryService_.back(workloads);
  }
}

const i18n = {
  /** @export {string} @desc Title for the dialog shown on deploy validation error. */
  MSG_DEPLOY_ANYWAY_DIALOG_TITLE: goog.getMsg('Validation error occurred'),

  /** @export {string} @desc Content for the dialog shown on deploy validation error. */
  MSG_DEPLOY_ANYWAY_DIALOG_CONTENT: goog.getMsg('Would you like to deploy anyway?'),

  /** @export {string} @desc Confirmation text for the dialog shown on deploy validation error. */
  MSG_DEPLOY_ANYWAY_DIALOG_OK: goog.getMsg('Yes'),

  /** @export {string} @desc Cancellation text for the dialog shown on deploy validation error. */
  MSG_DEPLOY_ANYWAY_DIALOG_CANCEL: goog.getMsg('No'),

  /** @export {string} @desc Text shown on failed deploy in error dialog. */
  MSG_DEPLOY_DIALOG_ERROR: goog.getMsg('Deploying file has failed'),
};
