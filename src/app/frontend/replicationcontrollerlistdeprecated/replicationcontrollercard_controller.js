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

import {StateParams} from 'replicationcontrollerdetail/replicationcontrollerdetail_state';
import {stateName} from 'replicationcontrollerdetail/replicationcontrollerdetail_state';

/**
 * Controller for the replication controller card.
 *
 * @final
 */
export default class ReplicationControllerCardController {
  /**
   * @param {!ui.router.$state} $state
   * @ngInject
   */
  constructor($state) {
    /**
     * Initialized from the scope.
     * @export {!backendApi.ReplicationController}
     */
    this.replicationController;

    /** @private {!ui.router.$state} */
    this.state_ = $state;
  }

  /**
   * @return {string}
   * @export
   */
  getReplicationControllerDetailHref() {
    return this.state_.href(
        stateName,
        new StateParams(this.replicationController.namespace, this.replicationController.name));
  }

  /**
   * @return {boolean}
   * @export
   */
  areDesiredPodsRunning() {
    return this.replicationController.pods.running === this.replicationController.pods.desired;
  }

  /**
   * Returns true if any of replication controller pods has warning, false otherwise
   * @return {boolean}
   * @export
   */
  hasWarnings() { return this.replicationController.pods.warnings.length > 0; }

  /**
   * Returns true if replication controller pods have no warnings and there is at least one pod
   * in pending state, false otherwise
   * @return {boolean}
   * @export
   */
  isPending() { return !this.hasWarnings() && this.replicationController.pods.pending > 0; }
}
