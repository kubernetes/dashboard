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

import showDeleteReplicationControllerDialog from './deletereplicationcontroller_dialog';
import showUpdateReplicasDialog from './updatereplicas_dialog';

/**
 * Opens replication controller delete dialog.
 *
 * @final
 */
export class ReplicationControllerService {
  /**
   * @param {!md.$dialog} $mdDialog
   * @ngInject
   */
  constructor($mdDialog) {
    /** @private {!md.$dialog} */
    this.mdDialog_ = $mdDialog;
  }

  /**
   * Opens a replication controller delete dialog. Returns a promise that is resolved/rejected when
   * user wants
   * to delete the replica. Nothing happens when user clicks cancel on the dialog.
   *
   * @param {string} namespace
   * @param {string} replicationController
   * @return {!angular.$q.Promise}
   */
  showDeleteDialog(namespace, replicationController) {
    return showDeleteReplicationControllerDialog(this.mdDialog_, namespace, replicationController);
  }

  /**
   * Opens an update replication controller dialog. Returns a promise that is resolved/rejected when
   * user wants
   * to update the replicas. Nothing happens when user clicks cancel on the dialog.
   *
   * @param {string} namespace
   * @param {string} replicationController
   * @param {number} currentPods
   * @param {number} desiredPods
   * @returns {!angular.$q.Promise}
   */
  showUpdateReplicasDialog(namespace, replicationController, currentPods, desiredPods) {
    return showUpdateReplicasDialog(
        this.mdDialog_, namespace, replicationController, currentPods, desiredPods);
  }
}
