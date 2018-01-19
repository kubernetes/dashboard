// Copyright 2017 The Kubernetes Authors.
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
 * @final
 */
export default class DaemonSetInfoController {
  /**
   * Constructs daemon set info object.
   * @ngInject
   */
  constructor() {
    /**
     * Daemon set details. Initialized from the scope.
     * @export {!backendApi.DaemonSetDetail}
     */
    this.daemonSet;
  }

  /**
   * @return {boolean}
   * @export
   */
  areDesiredPodsRunning() {
    return this.daemonSet.podInfo.running === this.daemonSet.podInfo.desired;
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
