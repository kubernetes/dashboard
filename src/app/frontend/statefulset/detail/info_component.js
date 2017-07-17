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
export default class StatefulSetInfoController {
  /**
   * Constructs statefultion controller info object.
   * @param {!ui.router.$state} $state
   * @ngInject
   */
  constructor($state) {
    /**
     * Stateful set details. Initialized from the scope.
     * @export {!backendApi.StatefulSetDetail}
     */
    this.statefulSet;

    /** @private {!ui.router.$state} */
    this.state_ = $state;
  }

  /**
   * @return {boolean}
   * @export
   */
  areDesiredPodsRunning() {
    return this.statefulSet.podInfo.running === this.statefulSet.podInfo.desired;
  }

  /**
   * @return {string}
   * @export
   */
  getLogsHref() {
    return this.state_.href(
        logsStateName,
        new LogsStateParams(
            this.statefulSet.objectMeta.namespace, this.statefulSet.objectMeta.name,
            'statefulset'));
  }
}

/**
 * Definition object for the component that displays stateful set info.
 *
 * @return {!angular.Component}
 */
export const statefulSetInfoComponent = {
  controller: StatefulSetInfoController,
  templateUrl: 'statefulset/detail/info.html',
  bindings: {
    /** {!backendApi.StatefulSetDetail} */
    'statefulSet': '=',
  },
};
