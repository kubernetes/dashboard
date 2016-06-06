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
 * Controller for the upload directive.
 *
 * @final
 */
export class UploadController {
  /** @ngInject */
  constructor() {
    /** @private {boolean} */
    this.isBrowseFileFuncRegistered_ = false;

    /**
     * Browse file function which is defined by the clients.
     *
     * Initialized from the registerBrowseFileFunction method.
     * @private {(function())|undefined} */
    this.browseFileFunc_;

    /**
     * Initialized from the scope.
     * @export {!angular.FormController}
     */
    this.form;

    /**
     * @export
     */
    this.i18n = i18n;
  }

  /**
   * @param {function()} func
   * @export
   */
  registerBrowseFileFunction(func) {
    if (this.isBrowseFileFuncRegistered_) {
      return;
    }
    this.browseFileFunc_ = func;
    this.isBrowseFileFuncRegistered_ = true;
  }

  /**
   * Opens browse file window in the browser.
   *
   * @export
   */
  browseFile() {
    if (this.browseFileFunc_) {
      this.browseFileFunc_();
    }
  }

  /**
   * Used to deactivate the invalid file name report if the form is not submitted yet.
   *
   * @returns {boolean}
   * @export
   */
  isFileNameError() {
    /** @type {!angular.NgModelController} */
    let fileName = this.form['fileName'];
    return this.form.$submitted && fileName.$invalid;
  }
}

const i18n = {
  /** @export {string} @desc A 'YAML or JSON file' label, serving as placeholder for an empty
     file input field on the deploy page. */
  MSG_DEPLOY_UPLOAD_FILE_YAML_OR_JSON_LABEL: goog.getMsg(`YAML or JSON file`),

  /** @export {string} @desc Appears to tell the user that he/she must upload a YAML or a JSON
     file on the deploy page. */
  MSG_DEPLOY_UPLOAD_FILE_REQUIRED_WARNING: goog.getMsg(`File is required`),

  /** @export {string} @desc User help for the YAML/JSON file upload form on the deploy page. */
  MSG_DEPLOY_UPLOAD_FILE_USER_HELP:
      goog.getMsg(`Select a YAML or JSON file, specifying the resources to deploy.`),

  /** @export {string} @desc The text is used as a 'Learn more' link text besides the file
     upload on the deploy page. */
  MSG_DEPLOY_UPLOAD_FILE_LEARN_MORE_ACTION: goog.getMsg(`Learn more`),
};
