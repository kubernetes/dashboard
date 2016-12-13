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
import {stateName} from 'replicasetdetail/replicasetdetail_state';

/**
 * Controller for the replica set card.
 *
 * @final
 */
export default class ReplicaSetCardController {
  /**
   * @param {!ui.router.$state} $state
   * @param {!angular.$interpolate} $interpolate
   * @param {!./../common/namespace/namespace_service.NamespaceService} kdNamespaceService
   * @ngInject
   */
  constructor($state, $interpolate, kdNamespaceService) {
    /**
     * Initialized from the scope.
     * @export {!backendApi.ReplicaSet}
     */
    this.replicaSet;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @private */
    this.interpolate_ = $interpolate;

    /** @private {!./../common/namespace/namespace_service.NamespaceService} */
    this.kdNamespaceService_ = kdNamespaceService;
  }

  /**
   * @return {boolean}
   * @export
   */
  areMultipleNamespacesSelected() {
    return this.kdNamespaceService_.areMultipleNamespacesSelected();
  }

  /**
   * @return {string}
   * @export
   */
  getReplicaSetDetailHref() {
    return this.state_.href(
        stateName,
        new StateParams(this.replicaSet.objectMeta.namespace, this.replicaSet.objectMeta.name));
  }

  /**
   * Returns true if any of replica set pods has warning, false otherwise
   * @return {boolean}
   * @export
   */
  hasWarnings() {
    return this.replicaSet.pods.warnings.length > 0;
  }

  /**
   * Returns true if replica set pods have no warnings and there is at least one pod
   * in pending state, false otherwise
   * @return {boolean}
   * @export
   */
  isPending() {
    return !this.hasWarnings() && this.replicaSet.pods.pending > 0;
  }

  /**
   * @return {boolean}
   * @export
   */
  isSuccess() {
    return !this.isPending() && !this.hasWarnings();
  }

  /**
   * @export
   * @param  {string} creationDate - creation date of the replica set
   * @return {string} localized tooltip with the formated creation date
   */
  getCreatedAtTooltip(creationDate) {
    let filter = this.interpolate_(`{{date | date}}`);
    /** @type {string} @desc Tooltip 'Created at [some date]' showing the exact creation time of
     * replica set. */
    let MSG_REPLICA_SET_LIST_CREATED_AT_TOOLTIP =
        goog.getMsg('Created at {$creationDate}', {'creationDate': filter({'date': creationDate})});
    return MSG_REPLICA_SET_LIST_CREATED_AT_TOOLTIP;
  }
}

/**
 * @return {!angular.Component}
 */
export const replicaSetCardComponent = {
  bindings: {
    'replicaSet': '=',
    'showResourceKind': '<',
  },
  controller: ReplicaSetCardController,
  templateUrl: 'replicasetlist/replicasetcard.html',
};
