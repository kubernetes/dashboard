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
import showEditDialog from './editresource_dialog';

/**
 * Verber service for performing common verb operations on resources, e.g., deleting or editing
 * them.
 * @final
 */
export class VerberService {
  /**
   * @param {!md.$dialog} $mdDialog
   * @param {!angular.$q} $q
   * @ngInject
   */
  constructor($mdDialog, $q) {
    /** @private {!md.$dialog} */
    this.mdDialog_ = $mdDialog;

    /** @private {!angular.$q} */
    this.q_ = $q;
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
    let deferred = this.q_.defer();

    showDeleteDialog(this.mdDialog_, resourceKindName, typeMeta, objectMeta)
        .then(() => {
          deferred.resolve();
        })
        .catch((err) => {
          this.deleteErrorCallback(err);
          deferred.reject(err);
        });

    return deferred.promise;
  }

  /**
   * Opens a resource update dialog. Returns a promise that is resolved/rejected when
   * user wants to update the resource. Nothing happens when user clicks cancel on the dialog.
   * @param {string} resourceKindName
   * @param {!backendApi.TypeMeta} typeMeta
   * @param {!backendApi.ObjectMeta} objectMeta
   * @return {!angular.$q.Promise}
   */
  showEditDialog(resourceKindName, typeMeta, objectMeta) {
    let deferred = this.q_.defer();

    showEditDialog(this.mdDialog_, resourceKindName, typeMeta, objectMeta)
        .then(() => {
          deferred.resolve();
        })
        .catch((err) => {
          this.editErrorCallback(err);
          deferred.reject(err);
        });

    return deferred.promise;
  }

  /**
   * Callback function to show dialog with error message if resource deletion fails.
   *
   * @param {angular.$http.Response|null} err
   */
  deleteErrorCallback(err) {
    if (err) {
      // Show dialog if there was an error, not user canceling dialog.
      this.mdDialog_.show(this.mdDialog_.alert()
                              .ok('Ok')
                              .title(err.statusText || 'Internal server error')
                              .textContent(err.data || 'Could not delete the resource'));
    }
  }

  /**
   * Callback function to show dialog with error message if resource edit fails.
   *
   * @param {angular.$http.Response|null} err
   */
  editErrorCallback(err) {
    if (err) {
      // Show dialog if there was an error, not user canceling dialog.
      this.mdDialog_.show(this.mdDialog_.alert()
                              .ok('Ok')
                              .title(err.statusText || 'Internal server error')
                              .textContent(err.data || 'Could not edit the resource'));
    }
  }
}
