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
 *
 * @final
 */
export default class LogsController {
  /**
   * @param {!angular.$log} $log
   * @param {!angular.$resource} $resource
   * @param {!backendApi.ReplicaSetDetail} replicaSetDetail
   * @param {{registerListener: Function, notifyPodChange: Function, notifyTextColorChange:
   * Function}} logsService
   * @ngInject
   */
  constructor($log, $resource, replicaSetDetail, logsService) {
    /** @private {!angular.$log} */
    this.log_ = $log;

    /** @private {!angular.$resource} */
    this.resource_ = $resource;

    /** @export {Array<string>} Log set. */
    this.logsSet = [];

    /**
     * Flag indicates color state of log area.
     * If false: black text is placed on white area. Otherwise colors are inverted.
     * @export {boolean}
     */
    this.isTextColorInverted = false;

    logsService.registerListener(this);

    this.initialize_(replicaSetDetail);
  }

  /**
   * @param {!backendApi.ReplicaSetDetail} replicaSetDetail
   * @private
   */
  initialize_(replicaSetDetail) {
    /** @type {!Array<!backendApi.ReplicaSetPod>} */
    let pods = replicaSetDetail.pods || [];

    /**
     * Currently chosen pod.
     * @type {(backendApi.ReplicaSetPod|undefined)}
     */
    let pod = pods.length > 0 ? pods[0] : undefined;
    if (angular.isDefined(pod)) {
      this.getLogs_(replicaSetDetail.namespace, pod.name);
    }
  }

  /**
   * @param {string} namespace
   * @param {string} podId
   * @private
   */
  getLogs_(namespace, podId) {
    /** @type {!angular.Resource<!backendApi.Logs>} */
    let resource = this.resource_(`/api/logs/${namespace}/${podId}`);

    resource.get(
        (logs) => {
          this.log_.info('Successfully fetched logs: ', logs);
          this.logsSet = logs.logs;
        },
        (err) => { this.log_.error('Error fetching logs: ', err); });
  }

  /**
   * On pod change listener.
   * @param {string} namespace
   * @param {string} podId
   */
  onPodChange(namespace, podId) { this.getLogs_(namespace, podId); }

  /**
   * On text color change listener.
   * Execute a code when a user changes logs panel color.
   * @export
   */
  onTextColorChange() { this.isTextColorInverted = !this.isTextColorInverted; }
}
