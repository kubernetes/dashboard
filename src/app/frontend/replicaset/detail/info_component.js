// Copyright 2017 The Kubernetes Dashboard Authors.
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

import {stateName as logsStateName, StateParams as LogsStateParams} from 'logs/state';

/**
 * @final
 */
export default class ReplicaSetInfoController {
  /**
   * Constructs replica set info object.
   * @param {!ui.router.$state} $state
   * @ngInject
   */
  constructor($state) {
    /**
     * Replica set details. Initialized from the scope.
     * @export {!backendApi.ReplicaSetDetail}
     */
    this.replicaSet;

    /** @private {!ui.router.$state} */
    this.state_ = $state;
  }

  /**
   * @return {boolean}
   * @export
   */
  areDesiredPodsRunning() {
    return this.replicaSet.podInfo.running === this.replicaSet.podInfo.desired;
  }

  /**
   * Returns link to teh log view
   * @return {string}
   * @export
   */
  getLogsHref() {
    return this.state_.href(
        logsStateName,
        new LogsStateParams(
            this.replicaSet.objectMeta.namespace, this.replicaSet.objectMeta.name, 'replicaset'));
  }
}

/**
 * Definition object for the component that displays replica set info.
 *
 * @return {!angular.Component}
 */
export const replicaSetInfoComponent = {
  controller: ReplicaSetInfoController,
  templateUrl: 'replicaset/detail/info.html',
  bindings: {
    /** {!backendApi.ReplicaSetDetail} */
    'replicaSet': '=',
  },
};
