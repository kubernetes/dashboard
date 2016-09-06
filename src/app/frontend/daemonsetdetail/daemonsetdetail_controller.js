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
export class DaemonSetDetailController {
  /**
   * @param {!backendApi.DaemonSetDetail} daemonSetDetail
   * @param {!angular.Resource} kdDaemonSetPodsResource
   * @param {!angular.Resource} kdDaemonSetServicesResource
   * @param {!angular.Resource} kdDaemonSetEventsResource
   * @ngInject
   */
  constructor(
      daemonSetDetail, kdDaemonSetPodsResource, kdDaemonSetServicesResource,
      kdDaemonSetEventsResource) {
    /** @export {!backendApi.DaemonSetDetail} */
    this.daemonSetDetail = daemonSetDetail;

    /** @export {!angular.Resource} */
    this.daemonSetPodsResource = kdDaemonSetPodsResource;

    /** @export {!angular.Resource} */
    this.daemonSetServicesResource = kdDaemonSetServicesResource;

    /** @export {!angular.Resource} */
    this.daemonSetEventsResource = kdDaemonSetEventsResource;

    /** @export */
    this.i18n = i18n;
  }
}

const i18n = {
  /** @export {string} @desc Label 'Overview' on the left navigation tab on the daemon set detail
     page. */
  MSG_DAEMON_SET_DETAIL_OVERVIEW_LABEL: goog.getMsg('Overview'),
  /** @export {string} @desc Title 'Pods' for the pods information section on the daemon set detail
     page. */
  MSG_DAEMON_SET_DETAIL_PODS_TITLE: goog.getMsg('Pods'),
  /** @export {string} @desc Title 'Services' for the services information section on the daemon set
   *  detail page. */
  MSG_DAEMON_SET_DETAIL_SERVICES_TITLE: goog.getMsg('Services'),
  /** @export {string} @desc Label 'Events' on the right navigation tab on the daemon set detail
     page. */
  MSG_DAEMON_SET_DETAIL_EVENTS_LABEL: goog.getMsg('Events'),
  /** @export {string} @desc Title for pods card zerostate in daemon set details page. */
  MSG_DAEMON_SET_DETAIL_PODS_ZEROSTATE_TITLE: goog.getMsg('There is nothing to display here'),
  /** @export {string} @desc Text for pods card zerostate in daemon set details page. */
  MSG_DAEMON_SET_DETAIL_PODS_ZEROSTATE_TEXT:
      goog.getMsg('There are currently no Pods scheduled on this Daemon Set'),
  /** @export {string} @desc Title for graph card displaying metrics of one daemon set. */
  MSG_DAEMON_SET_DETAIL_GRAPH_CARD_TITLE: goog.getMsg('Resource usage history'),
};
