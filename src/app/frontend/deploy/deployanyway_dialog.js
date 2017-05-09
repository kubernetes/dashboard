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
 * Displays deploy anyway confirm dialog.
 *
 * @param {!md.$dialog} mdDialog
 * @param {string} errorMessage
 * @return {!angular.$q.Promise}
 */
export default function showDeployAnywayDialog(mdDialog, errorMessage) {
  let dialog = mdDialog.confirm()
                   .title(i18n.MSG_DEPLOY_ANYWAY_DIALOG_TITLE)
                   .htmlContent(`${errorMessage}<br><br>${i18n.MSG_DEPLOY_ANYWAY_DIALOG_CONTENT}`)
                   .ok(i18n.MSG_DEPLOY_ANYWAY_DIALOG_OK)
                   .cancel(i18n.MSG_DEPLOY_ANYWAY_DIALOG_CANCEL);

  return mdDialog.show(dialog);
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
};
