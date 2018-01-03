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

import {namespaceParam} from '../chrome/state';
import {stateName as overview} from '../overview/state';

/** @final */
export class DeployService {
  /**
   * @param {!angular.$log} $log
   * @param {!ui.router.$state} $state
   * @param {!../chrome/state.StateParams} $stateParams
   * @param {!angular.$resource} $resource
   * @param {!angular.$q} $q
   * @param {!md.$dialog} $mdDialog
   * @param {!../common/errorhandling/dialog.ErrorDialog} errorDialog
   * @param {!../common/errorhandling/localizer_service.LocalizerService} localizerService
   * @param {!../common/csrftoken/service.CsrfTokenService} kdCsrfTokenService
   * @param {string} kdCsrfTokenHeader
   * @ngInject
   */
  constructor(
      $log, $state, $stateParams, $resource, $q, $mdDialog, errorDialog, localizerService,
      kdCsrfTokenService, kdCsrfTokenHeader) {
    /** @private {!angular.$log} */
    this.log_ = $log;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @private {!../chrome/state.StateParams} */
    this.stateParams_ = $stateParams;

    /** @private {!angular.$resource} */
    this.resource_ = $resource;

    /** @private {!angular.$q} */
    this.q_ = $q;

    /** @private {!md.$dialog} */
    this.mdDialog_ = $mdDialog;

    /** @private {!../common/errorhandling/dialog.ErrorDialog} */
    this.errorDialog_ = errorDialog;

    /** @private {!../common/errorhandling/localizer_service.LocalizerService} */
    this.localizerService_ = localizerService;

    /** @private {string} */
    this.csrfHeaderName_ = kdCsrfTokenHeader;

    /** @private {!./../common/csrftoken/service.CsrfTokenService} */
    this.tokenService_ = kdCsrfTokenService;

    /** @export */
    this.i18n = i18n;

    /** @private {boolean} */
    this.isDeployInProgress_ = false;
  }

  /**
   * @param {!backendApi.AppDeploymentSpec} spec
   */
  deploy(spec) {
    let defer = this.q_.defer();
    let tokenPromise = this.tokenService_.getTokenForAction('appdeployment');

    tokenPromise.then(
        (token) => {
          /** @type {!angular.Resource} */
          let resource = this.resource_(
              'api/v1/appdeployment', {},
              {save: {method: 'POST', headers: {[this.csrfHeaderName_]: token}}});
          this.isDeployInProgress_ = true;
          resource.save(
              spec,
              (savedConfig) => {
                defer.resolve(savedConfig);
                this.log_.info('Successfully deployed application: ', savedConfig);
                this.state_.go(overview, {[namespaceParam]: spec.namespace});
              },
              (err) => {
                defer.reject(err);
                this.log_.error('Error deploying application:', err);
              });
        },
        (err) => {
          defer.reject(err);
          this.log_.error('Error deploying application:', err);
        });

    defer.promise.finally(() => {
      this.isDeployInProgress_ = false;
    });
  }

  /**
   * @param {string} content
   * @param {boolean} validate
   * @param {string} name
   * @return {!angular.$q.Promise}
   */
  deployContent(content, validate = true, name = '') {
    let defer = this.q_.defer();
    let tokenPromise = this.tokenService_.getTokenForAction('appdeploymentfromfile');

    /** @type {!backendApi.AppDeploymentContentSpec} */
    let spec = {
      name: name,
      namespace: this.stateParams_.namespace || '',
      content: content,
      validate: validate,
    };

    tokenPromise.then(
        (token) => {
          /** @type {!angular.Resource} */
          let resource = this.resource_(
              'api/v1/appdeploymentfromfile', {},
              {save: {method: 'POST', headers: {[this.csrfHeaderName_]: token}}});
          this.isDeployInProgress_ = true;
          resource.save(
              spec,
              (response) => {
                defer.resolve(response);
                this.log_.info('Deployment is completed: ', response);
                if (response.error.length > 0) {
                  this.errorDialog_.open('Deployment has been partly completed', response.error);
                }
                this.state_.go(overview);
              },
              (err) => {
                defer.reject(err);
                if (this.hasValidationError_(err.data)) {
                  this.handleDeployAnywayDialog_(content, err.data);
                } else {
                  let errMsg = this.localizerService_.localize(err.data);
                  this.log_.error('Error deploying application:', err);
                  this.errorDialog_.open(this.i18n.MSG_DEPLOY_DIALOG_ERROR, errMsg);
                }
              });
        },
        (err) => {
          defer.reject(err);
          this.log_.error('Error deploying application:', err);
        });

    defer.promise
        .finally(() => {
          this.isDeployInProgress_ = false;
        })
        .catch((err) => {
          this.log_.error('Error:', err);
        });

    return defer.promise;
  }

  /**
   * Returns true when the deploy action should be enabled.
   *
   * @return {boolean}
   */
  isDeployDisabled() {
    return this.isDeployInProgress_;
  }

  /**
   * Returns true if given error contains information about validate=false argument, false
   * otherwise.
   *
   * @param {string} err
   * @return {boolean}
   * @private
   */
  hasValidationError_(err) {
    return err.indexOf('validate=false') > -1;
  }

  /**
   * Ask user if he would like to try deploy once more with validation turned off this time.
   *
   * @param {string} content
   * @param {string} err
   * @private
   */
  handleDeployAnywayDialog_(content, err) {
    this.showDeployAnywayDialog(err).then(() => {
      this.deployContent(content, false);
    });
  }

  /**
   * Displays deploy anyway confirm dialog.
   *
   * @param {string} errorMessage
   * @return {!angular.$q.Promise}
   */
  showDeployAnywayDialog(errorMessage) {
    let dialog = this.mdDialog_.confirm()
                     .title(i18n.MSG_DEPLOY_ANYWAY_DIALOG_TITLE)
                     .htmlContent(`${errorMessage}<br><br>${i18n.MSG_DEPLOY_ANYWAY_DIALOG_CONTENT}`)
                     .ok(i18n.MSG_DEPLOY_ANYWAY_DIALOG_OK)
                     .cancel(i18n.MSG_DEPLOY_ANYWAY_DIALOG_CANCEL);

    return this.mdDialog_.show(dialog);
  }
}

const i18n = {
  /** @export {string} @desc Text shown on failed deploy in error dialog. */
  MSG_DEPLOY_DIALOG_ERROR: goog.getMsg('Deploying file has failed'),

  /** @export {string} @desc Title for the dialog shown on deploy validation error. */
  MSG_DEPLOY_ANYWAY_DIALOG_TITLE: goog.getMsg('Validation error occurred'),

  /** @export {string} @desc Content for the dialog shown on deploy validation error. */
  MSG_DEPLOY_ANYWAY_DIALOG_CONTENT: goog.getMsg('Would you like to deploy anyway?'),

  /** @export {string} @desc Confirmation text for the dialog shown on deploy validation error. */
  MSG_DEPLOY_ANYWAY_DIALOG_OK: goog.getMsg('Yes'),

  /** @export {string} @desc Cancellation text for the dialog shown on deploy validation error. */
  MSG_DEPLOY_ANYWAY_DIALOG_CANCEL: goog.getMsg('No'),
};
