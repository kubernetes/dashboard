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

import {stateName as logsStateName} from 'logs/logs_state';
import {StateParams as LogsStateParams} from 'logs/logs_state';

export class ReplicationControllerPodsController {
  /**
   * @ngInject
   */
  constructor($state, $stateParams) {
    /**
     * Replication controller pods. Initialized from the scope.
     * @export {!Array<!backendApi.ReplicationControllerPod>}
     */
    this.pods;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @private {!./replicationcontrollerdetail_state.StateParams} */
    this.stateParams_ = $stateParams;
  }

  /**
   * @param {!backendApi.ReplicationControllerPod} pod
   * @export
   */
  getPodLogsHref(pod) {
    return this.state_.href(
        logsStateName,
        new LogsStateParams(
            this.stateParams_.namespace, this.stateParams_.replicationController, pod.name));
  }
}

/**
 * TODO(floreks): add doc
 * @type {!angular.Component}
 */
export const replicationControllerPodsComponent = {
  templateUrl: 'replicationcontrollerdetail/replicationcontrollerpods.html',
  controller: ReplicationControllerPodsController,
  bindings: {
    /** {!Array<!backendApi.ReplicationControllerPod>} */
    'pods': '=',
  },
};
