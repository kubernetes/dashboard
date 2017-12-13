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
 * This file contains all backend errors that can be localized. Should be kept in sync with
 * backend file: 'src/app/backend/errors/localizer.go'.
 */
export const kdErrors = {
  /** @export {kdError} */
  TOKEN_EXPIRED: 'MSG_TOKEN_EXPIRED_ERROR',
  /** @export {kdError} */
  ENCRYPTION_KEY_CHANGED: 'MSG_ENCRYPTION_KEY_CHANGED',
};

export const kdLocalizedErrors = {
  /**
   * @export {kdError} @desc Text shown on in error dialog when there is namespace mismatch between dashboard and yaml file.
   */
  MSG_DEPLOY_NAMESPACE_MISMATCH_ERROR: goog.getMsg(
      'Your file specifies a namespace that is inconsistent with the namespace currently selected in Dashboard. Either edit the namespace entry in your file or select a different namespace in Dashboard to deploy to (eg. \'All namespaces\' or the correct namespace provided in the file).'),

  /**
     @export {kdError} @desc Text shown on in error dialog when there is no namespace provided selected in both dashboard and yaml file.
   */
  MSG_DEPLOY_EMPTY_NAMESPACE_ERROR: goog.getMsg(
      'Dashboard and your file do not specify any namespace to deploy a resource. Please select a specific namespace in dashboard or add one in yaml file.'),

  /** @export {kdError} @desc Text shown when unauthorized user tries to log in. */
  MSG_LOGIN_UNAUTHORIZED_ERROR: goog.getMsg('Authentication failed. Please try again.'),

  /** @export {kdError} @desc Text shown when saved token could not be decrypted by backend. */
  MSG_ENCRYPTION_KEY_CHANGED: goog.getMsg('Session expired. Please log in again.'),

  /**
     @export {kdError} @desc Text shown on internal error page when user tries to access resource he does not have permissions to.
   */
  MSG_DASHBOARD_EXCLUSIVE_RESOURCE_ERROR:
      goog.getMsg('Trying to access/modify dashboard exclusive resource.'),

  /**
     @export {kdError} @desc Text shown when saved token could not be decrypted by backend or it has expired.
   */
  MSG_TOKEN_EXPIRED_ERROR: goog.getMsg('Session expired. Please log in again.'),

  /**
   * @export {kdError} @desc Text shown on internal error page when user is forbidden to access some page.
   */
  MSG_FORBIDDEN_ERROR: goog.getMsg('You do not have required permissions to access this page.'),

  /**
   * @export {kdError} @desc Error message shown when user does not have access to given resource.
   */
  MSG_FORBIDDEN_RESOURCE_ERROR:
      goog.getMsg('You do not have required permissions to access this resource.'),

  /**
   * @export {kdError} @desc Title shown on internal error page when user is forbidden to access some page.
   */
  MSG_FORBIDDEN_TITLE_ERROR: goog.getMsg('Forbidden'),
};

/**
 * @param {string} errStr
 * @param {...!kdError} errors
 */
export function isError(errStr, ...errors) {
  let found = false;
  errors.forEach((err) => {
    if (err === errStr.trim()) {
      found = true;
    }
  });

  return found;
}
