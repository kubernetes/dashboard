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
 * This file contains all backend errors that can be localized. Should be kept in sync with
 * backend file: 'src/app/backend/resource/common/errors.go'.
 */
export const kdErrors = {
  /** @export {string} @desc Text shown on in error dialog when there is namespace mismatch between dashboard and yaml file. */
  MSG_DEPLOY_NAMESPACE_MISMATCH_ERROR: goog.getMsg(
      'Your file specifies a namespace that is inconsistent with the namespace currently selected in Dashboard. Either edit the namespace entry in your file or select a different namespace in Dashboard to deploy to (eg. \'All namespaces\' or the correct namespace provided in the file).'),

  /** @export {string} @desc Text shown on in error dialog when there is no namespace provided selected in both dashboard and yaml file. */
  MSG_DEPLOY_EMPTY_NAMESPACE_ERROR: goog.getMsg(
      'Dashboard and your file do not specify any namespace to deploy a resource. Please select a specific namespace in dashboard or add one in yaml file.'),
};
