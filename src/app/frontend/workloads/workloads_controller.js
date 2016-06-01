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
 * @final
 */
export class WorkloadsController {
  /**
   * @param {!backendApi.Workloads} workloads
   * @ngInject
   */
  constructor(workloads) {
    /** @export {!backendApi.Workloads} */
    this.workloads = workloads;

    /**
     * @export
     * {!Object}
     */
    this.i18n = i18n;
  }
}

const i18n = {
  /** @export {string} @desc Workloads resource list title for daemon sets. */
  MSG_WORKLOADS_DAEMON_SETS_TILE: goog.getMsg('Daemon sets'),

  /** @export {string} @desc Workloads resource list title for deployments. */
  MSG_WORKLOADS_DEPLOYMENTS_TITLE: goog.getMsg('Deployments'),

  /** @export {string} @desc Workloads resource list title for pet sets. */
  MSG_WORKLOADS_PET_SETS_TITLE: goog.getMsg('Pet Sets'),

  /** @export {string} @desc Workloads resource list title for replica sets. */
  MSG_WORKLOADS_REPLICA_SETS_TITLE: goog.getMsg('Replica Sets'),

  /** @export {string} @desc Workloads resource list title for replication controller. */
  MSG_WORKLOADS_REPLICATION_CONTROLLERS_TITLE: goog.getMsg('Replication Controller'),

  /** @export {string} @desc Workloads resource list title for pods. */
  MSG_WORKLOADS_PODS_TITLE: goog.getMsg('Pods'),
};