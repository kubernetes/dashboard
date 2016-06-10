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

import {StateParams} from 'common/resource/resourcedetail';
import {StateParams as LogsStateParams, stateName as logsStateName} from 'logs/logs_state';
import {stateName} from 'poddetail/poddetail_state';

/**
 * @final
 */
export class PodCardListController {
  /**
   * @ngInject
   * @param {!ui.router.$state} $state
   * @param {!angular.$interpolate} $interpolate
   */
  constructor($state, $interpolate) {
    /**
     * List of pods. Initialized from the scope.
     * @export {!backendApi.PodList}
     */
    this.podList;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @private {!angular.$interpolate} */
    this.interpolate_ = $interpolate;

    /**
     * @export
     */
    this.i18n = i18n;
  }

  /**
   * @param {!backendApi.Pod} pod
   * @return {string}
   * @export
   */
  getPodLogsHref(pod) {
    return this.state_.href(
        logsStateName, new LogsStateParams(pod.objectMeta.namespace, pod.objectMeta.name));
  }

  /**
   * @param {!backendApi.Pod} pod
   * @return {string}
   * @export
   */
  getPodDetailHref(pod) {
    return this.state_.href(
        stateName, new StateParams(pod.objectMeta.namespace, pod.objectMeta.name));
  }

  /**
   * Checks if pod status is successful, i.e. running or succeeded.
   * @param pod
   * @return {boolean}
   * @export
   */
  isStatusSuccessful(pod) { return pod.podPhase === 'Running' || pod.podPhase === 'Succeeded'; }

  /**
   * Checks if pod status is pending.
   * @param pod
   * @return {boolean}
   * @export
   */
  isStatusPending(pod) { return pod.podPhase === 'Pending'; }

  /**
   * Checks if pod status is failed.
   * @param pod
   * @return {boolean}
   * @export
   */
  isStatusFailed(pod) { return pod.podPhase === 'Failed'; }

  /**
   * @export
   * @param  {string} startDate - start date of the pod
   * @return {string} localized tooltip with the formated start date
   */
  getStartedAtTooltip(startDate) {
    let filter = this.interpolate_(`{{date | date:'d/M/yy HH:mm':'UTC'}}`);
    /** @type {string} @desc Tooltip 'Started at [some date]' showing the exact start time of
     * the pod.*/
    let MSG_POD_LIST_STARTED_AT_TOOLTIP =
        goog.getMsg('Started at {$startDate} UTC', {'startDate': filter({'date': startDate})});
    return MSG_POD_LIST_STARTED_AT_TOOLTIP;
  }
}

/**
 * Definition object for the component that displays pods list card.
 *
 * @type {!angular.Component}
 */
export const podCardListComponent = {
  templateUrl: 'podlist/podcardlist.html',
  controller: PodCardListController,
  bindings: {
    /** {!backendApi.PodList} */
    'podList': '<',
    /** {boolean} */
    'selectable': '<',
    /** {boolean} */
    'withStatuses': '<',
  },
};

const i18n = {
  /** @export {string} @desc tooltip for failed pod card icon */
  MSG_POD_IS_FAILED_TOOLTIP: goog.getMsg('This pod has errors.'),
  /** @export {string} @desc tooltip for pending pod card icon */
  MSG_POD_IS_PENDING_TOOLTIP: goog.getMsg('This pod is in a pending state.'),
  /** @export {string} @desc Label 'Name' which appears as a column label in the table of
     pods (pod list view). */
  MSG_POD_LIST_NAME_LABEL: goog.getMsg('Name'),
  /** @export {string} @desc Label 'Status' which appears as a column label in the table of
     pods (pod list view). */
  MSG_POD_LIST_STATUS_LABEL: goog.getMsg('Status'),
  /** @export {string} @desc Label 'Restarts' which appears as a column label in the
     table of pods (pod list view). */
  MSG_POD_LIST_RESTARTS_LABEL: goog.getMsg('Restarts'),
  /** @export {string} @desc Label 'Age' which appears as a column label in the
     table of pods (pod list view). */
  MSG_POD_LIST_AGE_LABEL: goog.getMsg('Age'),
  /** @export {string} @desc Label 'Cluster IP' which appears as a column label in the table of
     pods (pod list view). */
  MSG_POD_LIST_CLUSTER_IP_LABEL: goog.getMsg('Cluster IP'),
  /** @export {string} @desc Label 'Logs' for the pod's logs which appears as a column label in the
     table of pods (pod list view). */
  MSG_POD_LIST_LOGS_LABEL: goog.getMsg('Logs'),
  /** @export {string} @desc Title 'Pod' which is used as a title for the delete/update
     dialogs (that can be opened from the pod list view.) */
  MSG_POD_LIST_POD_TITLE: goog.getMsg('Pod'),
};
