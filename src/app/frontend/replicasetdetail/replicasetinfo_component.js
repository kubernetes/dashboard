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
export default class ReplicaSetInfoController {
  /**
   * Constructs replica set info object.
   */
  constructor() {
    /**
     * Replica set details. Initialized from the scope.
     * @export {!backendApi.ReplicaSetDetail}
     */
    this.replicaSet;

    /** @export */
    this.i18n = i18n(this.replicaSet);
  }

  /**
   * @return {boolean}
   * @export
   */
  areDesiredPodsRunning() {
    return this.replicaSet.podInfo.running === this.replicaSet.podInfo.desired;
  }
}

/**
 * Definition object for the component that displays replica set info.
 *
 * @return {!angular.Directive}
 */
export const replicaSetInfoComponent = {
  controller: ReplicaSetInfoController,
  templateUrl: 'replicasetdetail/replicasetinfo.html',
  bindings: {
    /** {!backendApi.ReplicaSetDetail} */
    'replicaSet': '=',
  },
};

/**
 * @param  {!backendApi.ReplicaSetDetail} replicaSet
 * @return {!Object} a dictionary of translatable messages
 */
function i18n(replicaSet) {
  return {
    /** @export {string} @desc Subtitle 'Details' for the left section with general information
        about a replica set on the replica set details page.*/
    MSG_REPLICA_SET_DETAIL_DETAILS_SUBTITLE: goog.getMsg('Details'),
    /** @export {string} @desc Label 'Namespace' for the replica set namespace on the
        replica set details page.*/
    MSG_REPLICA_SET_DETAIL_NAMESPACE_LABEL: goog.getMsg('Namespace'),
    /** @export {string} @desc Label 'Name' for the replica set name on the replication
        controller details page.*/
    MSG_REPLICA_SET_DETAIL_NAME_LABEL: goog.getMsg('Name'),
    /** @export {string} @desc Label 'Label selector' for the replica set's labels list
        on the replica set details page.*/
    MSG_REPLICA_SET_DETAIL_LABELS_LABEL: goog.getMsg('Labels'),
    /** @export {string} @desc Label 'Images' for the list of images used in a replica
        set, on its details page. */
    MSG_REPLICA_SET_DETAIL_IMAGES_LABEL: goog.getMsg('Images'),
    /** @export {string} @desc Subtitle 'Status' for the right section with pod status information
        on the replica set details page.*/
    MSG_REPLICA_SET_DETAIL_STATUS_SUBTITLE: goog.getMsg('Status'),
    /** @export {string} @desc Label 'Pods' for the pods in a replica set on its details
        page.*/
    MSG_REPLICA_SET_DETAIL_PODS_LABEL: goog.getMsg('Pods'),
    /** @export {string} @desc Label 'Pods status' for the status of the pods in a replica
       set, on the replica set details page.*/
    MSG_REPLICA_SET_DETAIL_PODS_STATUS_LABEL: goog.getMsg('Pods status'),
    /** @export {string} @desc The message says that that many pods were created
        (replica set details page). */
    MSG_REPLICA_SET_DETAIL_PODS_CREATED_LABEL:
        goog.getMsg('{$podsCount} created', {'podsCount': replicaSet.podInfo.current}),
    /** @export {string} @desc The message says that that many pods are running
        (replica set details page). */
    MSG_REPLICA_SET_DETAIL_PODS_RUNNING_LABEL:
        goog.getMsg('{$podsCount} running', {'podsCount': replicaSet.podInfo.running}),
    /** @export {string} @desc The message says that that many pods are pending
        (replica set details page). */
    MSG_REPLICA_SET_DETAIL_PODS_PENDING_LABEL:
        goog.getMsg('{$podsCount} pending', {'podsCount': replicaSet.podInfo.pending}),
    /** @export {string} @desc The message says that that many pods have failed
        (replica set details page). */
    MSG_REPLICA_SET_DETAIL_PODS_FAILED_LABEL:
        goog.getMsg('{$podsCount} failed', {'podsCount': replicaSet.podInfo.failed}),
    /** @export {string} @desc The message says that that many pods are desired to run
        (replica set details page). */
    MSG_REPLICA_SET_DETAIL_PODS_DESIRED_LABEL:
        goog.getMsg('{$podsCount} desired', {'podsCount': replicaSet.podInfo.desired}),
  };
}
