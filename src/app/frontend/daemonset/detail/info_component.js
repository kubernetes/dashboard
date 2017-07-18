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
export default class DaemonSetInfoController {
  /**
   * Constructs daemon set info object.
   * @param {!ui.router.$state} $state
   * @ngInject
   */
  constructor($state) {
    /**
     * Daemon set details. Initialized from the scope.
     * @export {!backendApi.DaemonSetDetail}
     */
    this.daemonSet;

    /** @private {!ui.router.$state} */
    this.state_ = $state;
  }

  /**
   * @return {boolean}
   * @export
   */
  areDesiredPodsRunning() {
    return this.daemonSet.podInfo.running === this.daemonSet.podInfo.desired;
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
            this.daemonSet.objectMeta.namespace, this.daemonSet.objectMeta.name, 'daemonset'));
  }
}

/**
 * Definition object for the component that displays daemon set info.
 *
 * @return {!angular.Component}
 */
export const daemonSetInfoComponent = {
  controller: DaemonSetInfoController,
  templateUrl: 'daemonset/detail/info.html',
  bindings: {
    /** {!backendApi.DaemonSetDetail} */
    'daemonSet': '=',
  },
};
