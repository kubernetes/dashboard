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

import showDeleteReplicaSetDialog from './deletereplicaset_dialog';
import showUpdateReplicasDialog from './updatereplicas_dialog';

/**
 * Opens replica set delete dialog.
 *
 * @final
 */
export class ReplicaSetService {
  /**
   * @param {!md.$dialog} $mdDialog
   * @ngInject
   */
  constructor($mdDialog) {
    /** @private {!md.$dialog} */
    this.mdDialog_ = $mdDialog;
  }

  /**
   * Opens a replica set delete dialog. Returns a promise that is resolved/rejected when user wants
   * to delete the replica. Nothing happens when user clicks cancel on the dialog.
   *
   * @param {string} namespace
   * @param {string} replicaSet
   * @return {!angular.$q.Promise}
   */
  showDeleteDialog(namespace, replicaSet) {
    return showDeleteReplicaSetDialog(this.mdDialog_, namespace, replicaSet);
  }

  /**
   * Opens an update replica set dialog. Returns a promise that is resolved/rejected when user wants
   * to update the replicas. Nothing happens when user clicks cancel on the dialog.
   *
   * @param {string} namespace
   * @param {string} replicaSet
   * @param {number} currentPods
   * @param {number} desiredPods
   * @returns {!angular.$q.Promise}
   */
  showUpdateReplicasDialog(namespace, replicaSet, currentPods, desiredPods) {
    return showUpdateReplicasDialog(
        this.mdDialog_, namespace, replicaSet, currentPods, desiredPods);
  }
}
