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

import showDeleteDialog from './deleteresource_dialog';

/**
 * Verber service for performing common verb operations on resources, e.g., deleting or editing
 * them.
 * @final
 */
export class VerberService {
  /**
   * @param {!md.$dialog} $mdDialog
   * @ngInject
   */
  constructor($mdDialog) {
    /** @private {!md.$dialog} */
    this.mdDialog_ = $mdDialog;
  }

  /**
   * Opens a resource delete dialog. Returns a promise that is resolved/rejected when
   * user wants to delete the resource. Nothing happens when user clicks cancel on the dialog.
   * @param {string} resourceKindName
   * @param {!backendApi.TypeMeta} typeMeta
   * @param {!backendApi.ObjectMeta} objectMeta
   * @return {!angular.$q.Promise}
   */
  showDeleteDialog(resourceKindName, typeMeta, objectMeta) {
    return showDeleteDialog(this.mdDialog_, resourceKindName, typeMeta, objectMeta);
  }
}
