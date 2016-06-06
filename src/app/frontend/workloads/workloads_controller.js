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

    /** @export */
    this.i18n = i18n;
  }
}

const i18n = {
  /** @export {string} @desc Label "Daemon sets", which appears above the daemon sets list on the
     workloads page. */
  MSG_WORKLOADS_DEAMON_SETS_LABEL: goog.getMsg('Daemon sets'),
  /** @export {string} @desc Label "Deployments", which appears above the deployments list on the
     workloads page.*/
  MSG_WORKLOADS_DEPLOYMENTS_LABEL: goog.getMsg('Deployments'),
  /** @export {string} @desc Label "Pet Sets", which appears above the replica set list on the
     workloads page.*/
  MSG_WORKLOADS_PET_SETS_LABEL: goog.getMsg('Pet Sets'),
  /** @export {string} @desc Label "Replica sets", which appears above the replica sets list on the
     workloads page.*/
  MSG_WORKLOADS_REPLICA_SETS_LABEL: goog.getMsg('Replica sets'),
  /** @export {string} @desc Label "Replication controllers", which appears above the replication
     controllers list on the workloads page.*/
  MSG_WORKLOADS_REPLICATION_CONTROLLERS_LABEL: goog.getMsg('Replication controllers'),
  /** @export {string} @desc Label "Pods", which appears above the pods list on the workloads
     page.*/
  MSG_WORKLOADS_PODS_LABEL: goog.getMsg('Pods'),
};
