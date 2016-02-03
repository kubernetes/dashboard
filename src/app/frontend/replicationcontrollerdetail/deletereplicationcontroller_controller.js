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

import {StateParams} from './replicationcontrollerdetail_state';
import {getReplicationControllerDetailsResource} from './replicationcontrollerdetail_stateconfig';

/**
 * Controller for the delete replication controller dialog.
 *
 * @final
 */
export default class DeleteReplicationControllerDialogController {
  /**
   * @param {!md.$dialog} $mdDialog
   * @param {!angular.$resource} $resource
   * @param {string} namespace
   * @param {string} replicationController
   * @ngInject
   */
  constructor($mdDialog, $resource, namespace, replicationController) {
    /** @export {string} */
    this.replicationController = replicationController;

    /** @export {string} */
    this.namespace = namespace;

    /** @export {boolean} */
    this.deleteServices = false;

    /** @private {!md.$dialog} */
    this.mdDialog_ = $mdDialog;

    /** @private {!angular.$resource} */
    this.resource_ = $resource;
  }

  /**
   * Deletes the replication controller and closes the dialog.
   *
   * @export
   */
  remove() {
    let resource = getReplicationControllerDetailsResource(
        new StateParams(this.namespace, this.replicationController), this.resource_);

    /** @type {!backendApi.DeleteReplicationControllerSpec} */
    let deleteReplicationControllerSpec = {
      deleteServices: this.deleteServices,
    };

    resource.remove(
        deleteReplicationControllerSpec, () => { this.mdDialog_.hide(); },
        () => { this.mdDialog_.cancel(); });
  }

  /**
   * Cancels and closes the dialog.
   *
   * @export
   */
  cancel() { this.mdDialog_.cancel(); }
}
