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
 * Controller for the logs view.
 * @final
 */
export default class LogsToolbarController {
  /**
   * @param {!backendApi.ReplicaSetDetail} replicaSetDetail
   * @param {{registerListener: Function, notifyPodChange: Function, notifyTextColorChange:
   * Function}} logsService
   * @ngInject
   */
  constructor(replicaSetDetail, logsService) {
    /**
     * Service to notify logs controller if any changes on toolbar.
     * @export {!Object}
     */
    this.logManagementService = logsService;

    /** @export {!Array<!backendApi.ReplicaSetPod>} */
    this.pods = replicaSetDetail.pods || [];

    /**
     * Currently chosen pod.
     * @export {(backendApi.ReplicaSetPod|undefined)}
     */
    this.pod = this.pods.length > 0 ? this.pods[0] : undefined;

    /**
     * Pod creation time.
     * @type {string}
     */
    this.podCreationTime;

    /**
     * Namespace.
     * @export {string}
     */
    this.namespace = replicaSetDetail.namespace;

    /**
     * Flag indicates state of log area color.
     * If false: black text is placed on white area. Otherwise colors are inverted.
     * @export {boolean}
     */
    this.isTextColorInverted = false;

    if (angular.isDefined(this.pod)) {
      this.podCreationTime = new Date(Date.parse(this.pod.startTime)).toLocaleString();
    }
  }

  /**
   * Execute a code when a user changes the selected option of a pod element.
   * @param {string} podId
   * @export
   */
  onPodChange(podId) { this.logManagementService.notifyPodChange(this.namespace, podId); }

  /**
   * Execute a code when a user changes logs panel color.
   * @export
   */
  onTextColorChange() {
    this.isTextColorInverted = !this.isTextColorInverted;
    this.logManagementService.notifyTextColorChange();
  }
}
