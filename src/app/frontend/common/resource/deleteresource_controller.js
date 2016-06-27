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
 * Controller for the delete resource dialog.
 *
 * @final
 */
export class DeleteResourceController {
  /**
   * @param {!md.$dialog} $mdDialog
   * @param {!angular.$resource} $resource
   * @param {string} resourceKindName
   * @param {!backendApi.TypeMeta} typeMeta
   * @param {!backendApi.ObjectMeta} objectMeta
   * @ngInject
   */
  constructor($mdDialog, $resource, resourceKindName, typeMeta, objectMeta) {
    /** @private {!backendApi.TypeMeta} */
    this.typeMeta_ = typeMeta;

    /** @export {!backendApi.ObjectMeta} */
    this.objectMeta = objectMeta;

    /** @private {!md.$dialog} */
    this.mdDialog_ = $mdDialog;

    /** @private {!angular.$resource} */
    this.resource_ = $resource;

    /** @export */
    this.i18n = i18n(resourceKindName, objectMeta);
  }

  /**
   * @export
   */
  remove() {
    let resource = this.resource_(
        `api/v1/${this.typeMeta_.kind}/namespace/${this.objectMeta.namespace}/name/${this.objectMeta.name}`);
    resource.remove(this.mdDialog_.hide, this.mdDialog_.cancel);
  }

  /**
   * Cancels and closes the dialog.
   *
   * @export
   */
  cancel() { this.mdDialog_.cancel(); }
}

/**
 * @param {string} resourceKindName
 * @param {!backendApi.ObjectMeta} objectMeta
 * @return {!Object}
 */
function i18n(resourceKindName, objectMeta) {
  return {
    /** @export @desc Title for a delete resource dialog */
    MSG_DELETE_RESOURCE_DIALOG_TITLE:
        goog.getMsg('Delete a {$resourceKindName}', {'resourceKindName': resourceKindName}),
    /** @export @desc Label for cancel button */
    MSG_DELETE_RESOURCE_DIALOG_CANCEL: goog.getMsg('Cancel'),
    /** @export @desc Label for delete button */
    MSG_DELETE_RESOURCE_DIALOG_DELETE: goog.getMsg('Delete'),
    /** @export @desc Confirmation question, appears before any dashboard resource will be deleted. */
    MSG_DELETE_RESOURCE_CONFIRM_QUESTION: goog.getMsg(
        `Are you sure you want to delete {$resourceKindName}` +
            ` <kd-middle-ellipsis display-string="{$objectName}"></kd-middle-ellipsis>` +
            ` in namespace {$namespaceName}?`,
        {
          'resourceKindName': resourceKindName,
          'objectName': objectMeta.name,
          'namespaceName': objectMeta.namespace,
        }),
  };
}
