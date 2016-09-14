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
 * Controller for the replication controller list view.
 *
 * @final
 */
export class ReplicationControllerListController {
  /**
   * @param {!backendApi.ReplicationControllerList} replicationControllerList
   * @param {!angular.Resource} kdRCListResource
   * @ngInject
   */
  constructor(replicationControllerList, kdRCListResource) {
    /** @export {!backendApi.ReplicationControllerList} */
    this.replicationControllerList = replicationControllerList;

    /** @export {!angular.Resource} */
    this.rcListResource = kdRCListResource;

    /** @export */
    this.i18n = i18n;
  }

  /**
   * @return {boolean}
   * @export
   */
  shouldShowZeroState() {
    return this.replicationControllerList.replicationControllers.length === 0;
  }
}

const i18n = {
  /** @export {string} @desc Title for graph card displaying CPU metric of replication controllers. */
  MSG_REPLICATION_CONTROLLER_LIST_CPU_GRAPH_CARD_TITLE: goog.getMsg('CPU usage history'),
  /** @export {string} @desc Title for graph card displaying memory metric of replication controllers. */
  MSG_REPLICATION_CONTROLLER_LIST_MEMORY_GRAPH_CARD_TITLE: goog.getMsg('Memory usage history'),
};
