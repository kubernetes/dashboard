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
  /**
   * @param {!../common/namespace/service.NamespaceService} kdNamespaceService
   * @ngInject
   */
  constructor(kdNamespaceService) {
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

    /** @private {!../common/namespace/service.NamespaceService} */
    this.kdNamespaceService_ = kdNamespaceService;
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
   * @return {boolean}
   * @export
   */
  isFileNameError() {
    /** @type {!angular.NgModelController} */
    let fileName = this.form['fileName'];
    return this.form.$submitted && fileName.$invalid;
  }

  /**
   * @return {boolean}
   * @export
   */
  areMultipleNamespacesSelected() {
    return this.kdNamespaceService_.areMultipleNamespacesSelected();
  }
}
