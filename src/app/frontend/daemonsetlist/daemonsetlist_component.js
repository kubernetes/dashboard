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
import {stateName} from 'daemonsetdetail/daemonsetdetail_state';

/**
 * @final
 */
export class DaemonSetCardListController {
  /**
   * @param {!ui.router.$state} $state
   * @param {!angular.$interpolate} $interpolate
   * @ngInject
   */
  constructor($state, $interpolate) {
    /**
     * Initialized from the scope.
     * @export {!backendApi.ReplicationController}
     */
    this.daemonSets;

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
   * @param {!backendApi.Service} daemonSet
   * @return {string}
   * @export
   */
  getDaemonSetDetailHref(daemonSet) {
    return this.state_.href(
        stateName, new StateParams(daemonSet.objectMeta.namespace, daemonSet.objectMeta.name));
  }

  /**
   * Returns true if any of the object's pods have warning, false otherwise
   * @return {boolean}
   * @export
   */
  hasWarnings(daemonSet) { return daemonSet.pods.failed > 0; }

  /**
   * Returns true if the object's pods have no warnings and there is at least one pod
   * in pending state, false otherwise
   * @return {boolean}
   * @export
   */
  isPending(daemonSet) { return !this.hasWarnings(daemonSet) && daemonSet.pods.pending > 0; }

  /**
   * @return {boolean}
   * @export
   */
  isSuccess(daemonSet) { return !this.isPending(daemonSet) && !this.hasWarnings(daemonSet); }

  /**
   * @export
   * @param  {string} creationDate - creation date of the daemon set
   * @return {string} localized tooltip with the formated creation date
   */
  getCreatedAtTooltip(creationDate) {
    let filter = this.interpolate_(`{{date | date:'short'}}`);
    /** @type {string} @desc Tooltip 'Created at [some date]' showing the exact creation time of
     * the daemon set.*/
    let MSG_DAEMON_SET_LIST_CREATED_AT_TOOLTIP =
        goog.getMsg('Created at {$creationDate}', {'creationDate': filter({'date': creationDate})});
    return MSG_DAEMON_SET_LIST_CREATED_AT_TOOLTIP;
  }
}

/**
 * Definition object for the component that displays service card list.
 *
 * @type {!angular.Component}
 */
export const daemonSetCardListComponent = {
  templateUrl: 'daemonsetlist/daemonsetcardlist.html',
  controller: DaemonSetCardListController,
  bindings: {
    /** {!Array<!backendApi.Service>} */
    'daemonSets': '<',
    /** {boolean} */
    'selectable': '<',
    /** {boolean} */
    'withStatuses': '<',
  },
};

const i18n = {
  /** @export {string} @desc tooltip for failed pod card icon */
  MSG_PODS_ARE_FAILED_TOOLTIP: goog.getMsg('One or more pods have errors.'),
  /** @export {string} @desc tooltip for pending pod card icon */
  MSG_PODS_ARE_PENDING_TOOLTIP: goog.getMsg('One or more pods are in pending state.'),
  /** @export {string} @desc Label 'Name' which appears as a column label in the table of
     daemon sets (daemon set list view). */
  MSG_DAEMON_SET_LIST_NAME_LABEL: goog.getMsg('Name'),
  /** @export {string} @desc Label 'Labels' which appears as a column label in the table of
     daemon sets (daemon set list view). */
  MSG_DAEMON_SET_LIST_LABELS_LABEL: goog.getMsg('Labels'),
  /** @export {string} @desc Label 'Pods' which appears as a column label in the table of
     daemon sets (daemon set list view). */
  MSG_DAEMON_SET_LIST_PODS_LABEL: goog.getMsg('Pods'),
  /** @export {string} @desc Label 'Age' which appears as a column label in the table of
     daemon sets (daemon set list view). */
  MSG_DAEMON_SET_LIST_AGE_LABEL: goog.getMsg('Age'),
  /** @export {string} @desc Label 'Internal endpoints' which appears as a column label in the table
     of daemon sets (daemon set list view). */
  MSG_DAEMON_SET_LIST_INTERNAL_ENDPOINTS_LABEL: goog.getMsg('Internal endpoints'),
  /** @export {string} @desc Label 'External endpoints' which appears as a column label in the table
     of daemon sets (daemon set list view). */
  MSG_DAEMON_SET_LIST_EXTERNAL_ENDPOINTS_LABEL: goog.getMsg('External endpoints'),
  /** @export {string} @desc Label 'Images' which appears as a column label in the table of
     daemon sets (daemon set list view). */
  MSG_DAEMON_SET_LIST_IMAGES_LABEL: goog.getMsg('Images'),
  /** @export {string} @desc Title 'Daemon set' which is used as a title for the delete/update
     dialogs (that can be opened on the daemon set list view.) */
  MSG_DAEMON_SET_LIST_DAEMON_SET_TITLE: goog.getMsg('Daemon Set'),
};
