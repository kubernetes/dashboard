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

import {GlobalStateParams} from 'common/resource/globalresourcedetail';
import {stateName as logsStateName, StateParams as LogsStateParams} from 'logs/logs_state';
import {stateName} from 'nodedetail/nodedetail_state';

/**
 * @final
 */
export default class PodInfoController {
  /**
   * Constructs pod info object.
   * @param {!ui.router.$state} $state
   * @ngInject
   */
  constructor($state) {
    /**
     * Pod details. Initialized from the scope.
     * @export {!backendApi.PodDetail}
     */
    this.pod;

    /** @export */
    this.i18n = i18n;

    /** @private {!ui.router.$state} */
    this.state_ = $state;
  }

  /**
   * Returns link to connected node details page.
   * @return {string}
   * @export
   */
  getNodeDetailsHref() {
    return this.state_.href(stateName, new GlobalStateParams(this.pod.nodeName));
  }

  /**
   * @return {string}
   * @export
   */
  getLogsHref() {
    return this.state_.href(
        logsStateName,
        new LogsStateParams(this.pod.objectMeta.namespace, this.pod.objectMeta.name));
  }
}

/**
 * Definition object for the component that displays pod info.
 *
 * @return {!angular.Directive}
 */
export const podInfoComponent = {
  controller: PodInfoController,
  templateUrl: 'poddetail/podinfo.html',
  bindings: {
    /** {!backendApi.PodDetail} */
    'pod': '<',
  },
};

const i18n = {
  /** @export {string} @desc Subtitle 'Details' at the top of the resource details column at the
     pod detail view.*/
  MSG_POD_DETAIL_DETAILS_SUBTITLE: goog.getMsg('Pod'),
  /** @export {string} @desc Label 'Status' for the pod status in details part (left) of the pod
     details view.*/
  MSG_POD_DETAIL_STATUS_LABEL: goog.getMsg('Status'),
  /** @export {string} @desc Label for the pod logs in details part (left) of the pod
   details view.*/
  MSG_POD_DETAIL_LOGS_LABEL: goog.getMsg('View logs'),
  /** @export {string} @desc Subtitle 'Network' at the top of the column about network
     connectivity (right) at the pod detail view.*/
  MSG_POD_DETAIL_NETWORK_SUBTITLE: goog.getMsg('Network'),
  /** @export {string} @desc Label 'Node' for the node a pods is running on, appears in the
     connectivity part (right) of the pod details view.*/
  MSG_POD_DETAIL_NODE_LABEL: goog.getMsg('Node'),
  /** @export {string} @desc Label 'IP' for the pod internal IP, appears in the
     connectivity part (right) of the pod details view.*/
  MSG_POD_DETAIL_IP_LABEL: goog.getMsg('IP'),
};
