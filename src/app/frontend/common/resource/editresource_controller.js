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

/**
 * Controller for the edit resource dialog.
 *
 * @final
 */
export class EditResourceController {
  /**
   * @param {!md.$dialog} $mdDialog
   * @param {!angular.$http} $http
   * @param {!kdClipboard.Clipboard} clipboard
   * @param {!md.$toast} $mdToast
   * @param {string} resourceKindName
   * @param {string} resourceUrl
   * @param {./../errorhandling/localizer_service.LocalizerService} localizerService
   * @ngInject
   */
  constructor(
      $mdDialog, $http, clipboard, $mdToast, resourceKindName, resourceUrl, localizerService) {
    /** @export {string} */
    this.resourceKindName = resourceKindName;
    /** @export {Object} JSON representation of the edited resource. */
    this.data = null;
    /** @private {string} */
    this.resourceUrl = resourceUrl;
    /** @private {!md.$dialog} */
    this.mdDialog_ = $mdDialog;
    /** @private {!angular.$http} */
    this.http_ = $http;
    /** @private {!kdClipboard.Clipboard} */
    this.clipboard_ = clipboard;
    /** @private {!md.$toast} */
    this.toast_ = $mdToast;
    /** @private {./../errorhandling/localizer_service.LocalizerService} */
    this.localizerService_ = localizerService;

    this.init_();
  }

  /**
   * @private
   */
  init_() {
    let promise = this.http_.get(this.resourceUrl);
    promise.then(
        (/** !angular.$http.Response<Object>*/ response) => {
          this.data = response.data;
        },
        (err) => {
          this.showMessage_(`Error: ${this.localizerService_.localize(err.data)}`);
        });
  }

  /**
   * @export
   */
  update() {
    return this.http_.put(this.resourceUrl, this.data)
        .then(this.mdDialog_.hide, this.mdDialog_.cancel);
  }

  /**
   * @export
   */
  copy() {
    /**
     * @type {string} @desc Toast message appears when browser does not support clipboard
     */
    let MSG_UNSUPPORTED_TOAST = goog.getMsg('Unsupported browser');
    /**
     * @type {string} @desc Toast message appears when copied to clipboard.
     */
    let MSG_COPIED_TOAST = goog.getMsg('Copied to clipboard');
    /* if the clipboard functionality is not supported */
    if (!this.clipboard_.supported) {
      this.showMessage_(MSG_UNSUPPORTED_TOAST);
    } else {
      this.clipboard_.copyText(JSON.stringify(this.data, null, 2));
      this.showMessage_(MSG_COPIED_TOAST);
    }
  }

  /**
   * Cancels and closes the dialog.
   *
   * @export
   */
  cancel() {
    this.mdDialog_.cancel();
  }

  /**
   * show an error message
   *
   * @private
   * @param {string} message
   */
  showMessage_(message) {
    this.toast_
        .show(this.toast_.simple()
                  .textContent(message)
                  .position('top right')
                  .parent(document.getElementsByTagName('md-dialog')[0]))
        .then(() => {
          this.cancel();
        });
  }
}
