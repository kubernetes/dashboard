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
export class ReplicaSetDetailController {
  /**
   * @param {!backendApi.ReplicaSetDetail} replicaSetDetail
   * @param {!angular.Resource} kdReplicaSetPodsResource
   * @param {!angular.Resource} kdReplicaSetServicesResource
   * @param {!angular.Resource} kdReplicaSetEventsResource
   * @ngInject
   */
  constructor(
      replicaSetDetail, kdReplicaSetPodsResource, kdReplicaSetServicesResource,
      kdReplicaSetEventsResource) {
    /** @export {!backendApi.ReplicaSetDetail} */
    this.replicaSetDetail = replicaSetDetail;

    /** @export {!angular.Resource} */
    this.replicaSetPodsResource = kdReplicaSetPodsResource;

    /** @export {!angular.Resource} */
    this.replicaSetServicesResource = kdReplicaSetServicesResource;

    /** @export {!angular.Resource} */
    this.eventListResource = kdReplicaSetEventsResource;

    /** @export */
    this.i18n = i18n;
  }
}

const i18n = {
  /** @export {string} @desc Title 'Pods', which appears at the top of the pods list on the
      replica set details view. */
  MSG_REPLICA_SET_DETAIL_PODS_TITLE: goog.getMsg('Pods'),
  /** @export {string} @desc Title 'Services' for the services information section on the replica set
      details page. */
  MSG_REPLICA_SET_DETAIL_SERVICES_TITLE: goog.getMsg('Services'),
  /** @export {string} @desc Label 'Overview' for the left navigation tab on the replica
      set details page. */
  MSG_REPLICA_SET_DETAIL_OVERVIEW_LABEL: goog.getMsg('Overview'),
  /** @export {string} @desc Label 'Events' for the right navigation tab on the replica
      set details page. */
  MSG_REPLICA_SET_DETAIL_EVENTS_LABEL: goog.getMsg('Events'),
  /** @export {string} @desc Title for pods card zerostate in replica set details page. */
  MSG_REPLICA_SET_DETAIL_PODS_ZEROSTATE_TITLE: goog.getMsg('There is nothing to display here'),
  /** @export {string} @desc Text for pods card zerostate in replica set details page. */
  MSG_REPLICA_SET_DETAIL_PODS_ZEROSTATE_TEXT:
      goog.getMsg('There are currently no Pods scheduled on this Replica Set'),
  /** @export {string} @desc Title for services card zerostate in replica set details page. */
  MSG_REPLICA_SET_DETAIL_SERVICES_ZEROSTATE_TITLE: goog.getMsg('There is nothing to display here'),
  /** @export {string} @desc Text for services card zerostate in replica set details page. */
  MSG_REPLICA_SET_DETAIL_SERVICES_ZEROSTATE_TEXT: goog.getMsg(
      'There are currently no Services with the same label selector ' +
      'as this Replica Set'),
  /** @export {string} @desc Title for graph card displaying metrics of one replica set. */
  MSG_REPLICA_SET_DETAIL_GRAPH_CARD_TITLE: goog.getMsg('Resource usage history'),
};
