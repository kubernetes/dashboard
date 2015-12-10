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
 * Controller for the update replica set dialog.
 *
 * @final
 */
export default class UpdateReplicasDialogController {
  /**
   * @param {!md.$dialog} $mdDialog
   * @param {!angular.$log} $log
   * @param {!backendApi.ReplicaSetDetail} replicaSetDetail
   * @param {!function(number, function(!backendApi.ReplicaSetSpec),
   * function(!angular.$http.Response)=)} updateReplicasFn
   * @ngInject
   */
  constructor($mdDialog, $log, replicaSetDetail, updateReplicasFn) {
    /** @export {number} */
    this.replicas;

    /** @export {!backendApi.ReplicaSetDetail} */
    this.replicaSetDetail = replicaSetDetail;

    /** @private {!md.$dialog} */
    this.mdDialog_ = $mdDialog;

    /** @private {!function(number, function(!backendApi.ReplicaSetSpec),
     * function(!angular.$http.Response)=)} */
    this.updateReplicasFn_ = updateReplicasFn;

    /** @private {!angular.$log} */
    this.log_ = $log;
  }

  /**
   * Executes callback function to update replicas count in replica set.
   * @export
   */
  updateReplicasCount() {
    this.updateReplicasFn_(
        this.replicas, this.onUpdateReplicasSuccess_.bind(this),
        this.onUpdateReplicasError_.bind(this));
  }

  /**
   *  Cancels the update replica set dialog.
   *  @export
   */
  cancel() { this.mdDialog_.cancel(); }

  /**
   * @param {!backendApi.ReplicaSetSpec} updatedSpec
   * @private
   */
  onUpdateReplicasSuccess_(updatedSpec) {
    this.log_.info('Successfully updated replica set.');
    this.log_.info(updatedSpec);
    this.mdDialog_.hide();
  }

  /**
   * @param {!angular.$http.Response} err
   * @private
   */
  onUpdateReplicasError_(err) {
    this.log_.error(err);
    this.mdDialog_.hide();
  }
}
