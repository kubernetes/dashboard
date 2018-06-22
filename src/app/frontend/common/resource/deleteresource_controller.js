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
 * Controller for the delete resource dialog.
 *
 * @final
 */
export class DeleteResourceController {
  /**
   * @param {!md.$dialog} $mdDialog
   * @param {!angular.$resource} $resource
   * @param {string} resourceKindName
   * @param {string} resourceUrl
   * @param {!backendApi.ObjectMeta} objectMeta
   * @ngInject
   */
  constructor($mdDialog, $resource, resourceKindName, resourceUrl, objectMeta) {
    /** @private {string} */
    this.resourceUrl = resourceUrl;

    /** @export {!backendApi.ObjectMeta} */
    this.objectMeta = objectMeta;

    /** @private {!md.$dialog} */
    this.mdDialog_ = $mdDialog;

    /** @private {!angular.$resource} */
    this.resource_ = $resource;

    /** @export */
    this.resourceKindName = resourceKindName;
  }

  /**
   * @export
   */
  remove() {
    let resource = this.resource_(this.resourceUrl);
    resource.remove(this.mdDialog_.hide, this.mdDialog_.cancel);
  }

  /**
   * Cancels and closes the dialog.
   *
   * @export
   */
  cancel() {
    this.mdDialog_.cancel();
  }
}
