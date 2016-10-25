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

/**
 * Controller for the add respository dialog.
 *
 * @final
 */
export default class AddRepositoryDialogController {
  /**
   * @param {!md.$dialog} $mdDialog
   * @param {!angular.$log} $log
   * @param {!ui.router.$state} $state
   * @param {!angular.$resource} $resource
   * @ngInject
   */
  constructor($mdDialog, $log, $state, $resource) {
    /** @export {string} */
    this.repoName = '';

    /** @export {string} */
    this.repoURL = '';

    /** @private {!md.$dialog} */
    this.mdDialog_ = $mdDialog;

    /** @private {!angular.$log} */
    this.log_ = $log;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @private {!angular.$resource} */
    this.resource_ = $resource;

    /** @export {!angular.FormController} Initialized from the template */
    this.addRepositoryForm;

    /** @export */
    this.i18n = i18n();
  }


  /**
   * Add the specified reposotory.
   *
   * @export
   */
  addRepository() {
    if (this.addRepositoryForm.$valid) {
      /** @type {!backendApi.Repository} */
      let repositorySpec = {
        name: this.repoName,
        url: this.repoURL,
        phase: '',
      };

      let resource = this.resource_('api/v1/repository/');
      resource.save(
          repositorySpec, this.onAddRepositorySuccess_.bind(this),
          this.onAddRepositoryError_.bind(this));
    }
  }

  /**
   *  Cancels the add repository dialog.
   *  @export
   */
  cancel() {
    this.mdDialog_.cancel();
  }

  /**
   * @private
   */
  onAddRepositorySuccess_() {
    this.log_.info(`Successfully added repository`);
    this.mdDialog_.hide();
    this.state_.reload();
  }

  /**
   * @param {!angular.$http.Response} err
   * @private
   */
  onAddRepositoryError_(err) {
    this.log_.error(err);
    this.mdDialog_.hide();
  }
}

function i18n() {
  return {
    /** @export {string} @desc Title for the add repository dialog. */
    MSG_REPO_LIST_ADD_REPOSITORY_TITLE: goog.getMsg('Add a repository'),
    /** @export {string} @desc User help for the pod count update dialog (on the repository
        list page). */
    MSG_REPO_LIST_ADD_REPOSITORY_USER_HELP:
        goog.getMsg('Specify the name and URL of a chart repository to add'),
    /** @export {string} @desc Label for the repository name. */
    MSG_REPO_LIST_ADD_REPOSITORY_NAME_LABEL: goog.getMsg('Repository Name'),
    /** @export {string} @desc Warning for the repository Name. */
    MSG_REPO_LIST_REPOSITORY_NAME_REQUIRED_WARNING: goog.getMsg('Repository Name is required'),
    /** @export {string} @desc Label for the repository URL. */
    MSG_REPO_LIST_ADD_REPOSITORY_URL_LABEL: goog.getMsg('Repository URL'),
    /** @export {string} @desc Warning for the repository URL. */
    MSG_REPO_LIST_REPOSITORY_URL_REQUIRED_WARNING: goog.getMsg('Repository URL is required'),
    /** @export {string} @desc Action 'Cancel' for the cancel button on the "add repository
        dialog". */
    MSG_REPO_LIST_ADD_REPOSITORY_CANCEL_ACTION: goog.getMsg('Cancel'),
    /** @export {string} @desc Action 'OK' for the confirmation button on the "add repository
        dialog". */
    MSG_REPO_LIST_ADD_REPOSITORY_OK_ACTION: goog.getMsg('OK'),
  };
}
