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
 * @param {string} title
 * @param {string} content
 * @param {string} err
 * @param {string} okMsg
 * @param {string} cancelMsg
 * @return {!angular.$q.Promise}
 */
export default function showDeployAnywayDialog(mdDialog, title, content, err, okMsg, cancelMsg) {
  let dialog = mdDialog.confirm()
                   .title(title)
                   .htmlContent(`${err}<br><br>${content}`)
                   .ok(okMsg)
                   .cancel(cancelMsg);

  return mdDialog.show(dialog);
}
