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
export default class DaemonSetInfoController {
  /**
   * Constructs daemon set info object.
   */
  constructor() {
    /**
     * Daemon set details. Initialized from the scope.
     * @export {!backendApi.DaemonSet}
     */
    this.daemonSet;

    /** @export */
    this.i18n = i18n(this.daemonSet);
  }

  /**
   * @return {boolean}
   * @export
   */
  areDesiredPodsRunning() {
    return this.daemonSet.podInfo.running === this.daemonSet.podInfo.desired;
  }
}

/**
 * Definition object for the component that displays daemon set info.
 *
 * @return {!angular.Directive}
 */
export const daemonSetInfoComponent = {
  controller: DaemonSetInfoController,
  templateUrl: 'daemonsetdetail/daemonsetinfo.html',
  bindings: {
    /** {!backendApi.DaemonSet} */
    'daemonSet': '=',
  },
};

/**
 * @param  {!backendApi.DaemonSet} daemonSet
 * @return {!Object} a dictionary of translatable messages
 */
function i18n(daemonSet) {
  return {
    /** @export {string} @desc Title 'Resource details' at the top of the daemon set details page.*/
    MSG_DAEMON_SET_INFO_RESOURCE_DETAILS_TITLE: goog.getMsg('Resource details'),
    /** @export {string} @desc Subtitle 'Details' for the left section with general information
       about a daemon set on the daemonset details page.*/
    MSG_DAEMON_SET_INFO_DETAILS_SUBTITLE: goog.getMsg('Details'),
    /** @export {string} @desc Label 'Namespace' for the daemon set namespace on the details page.*/
    MSG_DAEMON_SET_INFO_NAMESPACE_LABEL: goog.getMsg('Namespace'),
    /** @export {string} @desc Label 'Name' for the daemon set name on the details page.*/
    MSG_DAEMON_SET_INFO_NAME_LABEL: goog.getMsg('Name'),
    /** @export {string} @desc Label 'Labels' for the daemon set's labels list on the
    daemon set details page.*/
    MSG_DAEMON_SET_INFO_LABELS_LABEL: goog.getMsg('Labels'),
    /** @export {string} @desc Label 'Images' for the list of images used in a daemon set, on its
       details page. */
    MSG_DAEMON_SET_INFO_IMAGES_LABEL: goog.getMsg('Images'),
    /** @export {string} @desc Subtitle 'Status' for the right section with pod status information
       on the daemon set details page.*/
    MSG_DAEMON_SET_INFO_STATUS_SUBTITLE: goog.getMsg('Status'),
    /** @export {string} @desc Label 'Pods' for the pods in a daemon set on its details page.*/
    MSG_DAEMON_SET_INFO_PODS_LABEL: goog.getMsg('Pods'),
    /** @export {string} @desc Label 'Pods status' for the status of the pods in a daemon set, on
       the daemon set details page.*/
    MSG_DAEMON_SET_INFO_PODS_STATUS_LABEL: goog.getMsg('Pods status'),
    /** @export {string} @desc The message says that that many pods were created
    (daemon set details page). */
    MSG_DAEMON_SET_INFO_PODS_CREATED_LABEL: goog.getMsg(
        '{$podsCount} created',
        {'podsCount': daemonSet && daemonSet.podInfo ? daemonSet.podInfo.current : '-'}),
    /** @export {string} @desc The message says that that many pods are running
    (daemon set details page). */
    MSG_DAEMON_SET_INFO_PODS_RUNNING_LABEL: goog.getMsg(
        '{$podsCount} running',
        {'podsCount': daemonSet && daemonSet.podInfo ? daemonSet.podInfo.running : '-'}),
    /** @export {string} @desc The message says that that many pods are pending
    (daemon set details page). */
    MSG_DAEMON_SET_INFO_PODS_PENDING_LABEL: goog.getMsg(
        '{$podsCount} pending',
        {'podsCount': daemonSet && daemonSet.podInfo ? daemonSet.podInfo.pending : '-'}),
    /** @export {string} @desc The message says that that many pods have failed
    (daemon set details page). */
    MSG_DAEMON_SET_INFO_PODS_FAILED_LABEL:
        goog.getMsg('{$podsCount} failed',
                    {'podsCount': daemonSet && daemonSet.podInfo ? daemonSet.podInfo.failed : '-'}),
    /** @export {string} @desc The message says that that many pods are desired to run
    (daemon set details page). */
    MSG_DAEMON_SET_INFO_PODS_DESIRED_LABEL: goog.getMsg(
        '{$podsCount} desired',
        {'podsCount': daemonSet && daemonSet.podInfo ? daemonSet.podInfo.desired : '-'}),
  };
}
