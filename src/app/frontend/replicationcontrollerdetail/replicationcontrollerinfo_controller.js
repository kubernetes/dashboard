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

import {stateName as replicationcontrollers} from 'replicationcontrollerlist/replicationcontrollerlist_state';

/**
 * Controller for the replication controller info directive.
 * @final
 */
export default class ReplicationControllerInfoController {
  /**
   * @param {!./replicationcontrollerdetail_state.StateParams} $stateParams
   * @param {!ui.router.$state} $state
   * @param {!angular.$log} $log
   * @param {!./replicationcontroller_service.ReplicationControllerService}
   * kdReplicationControllerService
   *
   * @ngInject
   */
  constructor($stateParams, $state, $log, kdReplicationControllerService) {
    /** @private {!./replicationcontrollerdetail_state.StateParams} */
    this.stateParams_ = $stateParams;

    /** @private {!./replicationcontroller_service.ReplicationControllerService} */
    this.kdReplicationControllerService_ = kdReplicationControllerService;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @private {!angular.$log} */
    this.log_ = $log;

    /**
     * Replication controller details. Initialized from the scope.
     * @export {!backendApi.ReplicationControllerDetail}
     */
    this.details;
  }

  /**
   * @return {boolean}
   * @export
   */
  areDesiredPodsRunning() { return this.details.podInfo.running === this.details.podInfo.desired; }

  /**
   * Handles update of replicas count in replication controller dialog.
   * @export
   */
  handleUpdateReplicasDialog() {
    this.kdReplicationControllerService_.showUpdateReplicasDialog(
        this.details.namespace, this.details.name, this.details.podInfo.current,
        this.details.podInfo.desired);
  }

  /**
   * Handles replication controller delete dialog.
   * @export
   */
  handleDeleteReplicationControllerDialog() {
    this.kdReplicationControllerService_
        .showDeleteDialog(this.stateParams_.namespace, this.stateParams_.replicationController)
        .then(this.onReplicationControllerDeleteSuccess_.bind(this));
  }

  /**
   * Callbacks used after clicking dialog confirmation button in order to delete replication
   * controller or log unsuccessful operation error.
   */

  /**
   * Changes state back to replication controller list after successful deletion of replication
   * controller.
   * @private
   */
  onReplicationControllerDeleteSuccess_() {
    this.log_.info('Replication controller successfully deleted.');
    this.state_.go(replicationcontrollers);
  }
}
