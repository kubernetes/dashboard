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
 * Controller for the logs menu view.
 *
 * @final
 */
export default class LogsMenuController {
  /**
   * @param {!angular.$log} $log
   * @param {!angular.$resource} $resource
   * @ngInject
   */
  constructor($log, $resource) {
    /** @private {!angular.$resource} */
    this.resource_ = $resource;

    /** @private {!angular.$log} */
    this.log_ = $log;

    /**
     * This is initialized from the scope.
     * @export {string}
     */
    this.replicaSetName;

    /**
     * This is initialized from the scope.
     * @export {string}
     */
    this.namespace;

    /**
     * This is initialized on open menu.
     * @export {!Array<!backendApi.ReplicaSetPodWithContainers>}
     */
    this.replicaSetPodsList;
  }

  /**
   * Opens menu with pods and link to logs.
   * @param  {!function(MouseEvent)} $mdOpenMenu
   * @param  {!MouseEvent} $event
   * @export
   */
  openMenu($mdOpenMenu, $event) {
    // This is needed to resolve problem with data refresh.
    // Sometimes old data was included to the new one for a while.
    if (this.replicaSetPodsList) {
      this.replicaSetPodsList = [];
    }
    this.getReplicaSetPods_();
    $mdOpenMenu($event);
  }

  /**
   * @private
   */
  getReplicaSetPods_() {
    /** @type {!angular.Resource<!backendApi.ReplicaSetPods>} */
    let resource =
        this.resource_(`/api/replicasets/pods/${this.namespace}/${this.replicaSetName}?limit=10`);

    resource.get(
        (replicaSetPods) => {
          this.log_.info('Successfully fetched Replica Set pods: ', replicaSetPods);
          this.replicaSetPodsList = replicaSetPods.pods;
        },
        (err) => { this.log_.error('Error fetching Replica Set pods: ', err); });
  }
}
