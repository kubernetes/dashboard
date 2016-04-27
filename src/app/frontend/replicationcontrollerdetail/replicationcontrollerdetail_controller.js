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
 * Controller for the replication controller details view.
 *
 * @final
 */
export default class ReplicationControllerDetailController {
  /**
   * @param {function(string):boolean} $mdMedia Angular Material $mdMedia service
   * @param {!backendApi.ReplicationControllerDetail} replicationControllerDetail
   * @param {!backendApi.Events} replicationControllerEvents
   * @ngInject
   */
  constructor($mdMedia, replicationControllerDetail, replicationControllerEvents) {
    /** @export {function(string):boolean} */
    this.mdMedia = $mdMedia;

    /** @export {!backendApi.ReplicationControllerDetail} */
    this.replicationControllerDetail = replicationControllerDetail;

    /** @export !Array<!backendApi.Event> */
    this.events = replicationControllerEvents.events;
  }

  /**
   * @param {!backendApi.ReplicationControllerPod} pod
   * @return {boolean}
   * @export
   */
  hasCpuUsage(pod) {
    return !!pod.metrics && !!pod.metrics.cpuUsageHistory && pod.metrics.cpuUsageHistory.length > 0;
  }

  /**
   * @param {!backendApi.ReplicationControllerPod} pod
   * @return {boolean}
   * @export
   */
  hasMemoryUsage(pod) {
    return !!pod.metrics && !!pod.metrics.memoryUsageHistory &&
        pod.metrics.memoryUsageHistory.length > 0;
  }

  /**
   * Returns either 1 (if the table cells containing sparklines should
   * shrink around their contents) or undefined (if those table cells
   * should obey regular layout rules). The idiosyncratic return
   * protocol is for compatibility with ng-attr's behavior - we want
   * to generate either "width=1" or nothing at all.
   *
   * @return {(number|undefined)}
   * @export
   */
  shouldShrinkSparklineCells() { return (this.mdMedia('gt-xs') || undefined) && 1; }
}
