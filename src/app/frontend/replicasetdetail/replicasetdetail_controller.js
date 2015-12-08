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
 * Controller for the replica set details view.
 *
 * @final
 */
export default class ReplicaSetDetailController {
  /**
   * @param {!backendApi.ReplicaSetDetail} replicaSetDetail
   * @param {!backendApi.Events} replicaSetEvents
   * @ngInject
   */
  constructor(replicaSetDetail, replicaSetEvents) {
    /** @export {!backendApi.ReplicaSetDetail} */
    this.replicaSetDetail = replicaSetDetail;

    /** @export {!backendApi.Events} */
    this.replicaSetEvents = replicaSetEvents;

    /** @const @export {!Array<string>} */
    this.eventTypeFilter = ['All', 'Warning'];

    /** @export {string} */
    this.eventType = this.eventTypeFilter[0];

    /** @const @export {!Array<string>} */
    this.eventSourceFilter = ['All', 'User', 'System'];

    /** @export {string} */
    this.eventSource = this.eventSourceFilter[0];
  }

  /**
   * TODO(floreks): Reuse this in replicasetlist controller.
   * Formats labels object to readable string.
   * @param {!Object} object
   * @return {string}
   * @export
   */
  formatLabelString(object) {
    let result = '';
    angular.forEach(object, function(value, key) { result += `,${key}=${value}`; });
    return result.substring(1);
  }
}
