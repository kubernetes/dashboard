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

import {StateParams, stateName} from 'daemonsetdetail/daemonsetdetail_state';

/**
 * @final
 */
export class DaemonSetCardListController {
  /**
   * @param {!ui.router.$state} $state
   * @ngInject
   */
  constructor($state) {
    /**
     * Initialized from the scope.
     * @export {!backendApi.ReplicationController}
     */
    this.daemonSets;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

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
};
