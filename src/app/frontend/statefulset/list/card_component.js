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
import {stateName} from 'statefulset/detail/state';

/**
 * Controller for the stateful set card.
 *
 * @final
 */
export default class StatefulSetCardController {
  /**
   * @param {!ui.router.$state} $state
   * @param {!angular.$interpolate} $interpolate
   * @param {!./../../common/namespace/service.NamespaceService} kdNamespaceService
   * @param {!./../../common/scaling/service.ScaleService} kdScaleService
   * @ngInject
   */
  constructor($state, $interpolate, kdNamespaceService, kdScaleService) {
    /**
     * Initialized from the scope.
     * @export {!backendApi.StatefulSet}
     */
    this.statefulSet;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @private */
    this.interpolate_ = $interpolate;

    /** @private {!./../../common/namespace/service.NamespaceService} */
    this.kdNamespaceService_ = kdNamespaceService;

    /** @private {!./../../common/scaling/service.ScaleService} */
    this.kdScaleService_ = kdScaleService;
  }

  /**
   * @return {boolean}
   * @export
   */
  areMultipleNamespacesSelected() {
    return this.kdNamespaceService_.areMultipleNamespacesSelected();
  }

  /**
   * @export
   */
  showScaleDialog() {
    this.kdScaleService_.showScaleDialog(
        this.statefulSet.objectMeta.namespace, this.statefulSet.objectMeta.name,
        this.statefulSet.pods.current, this.statefulSet.pods.desired,
        this.statefulSet.typeMeta.kind);
  }

  /**
   * @return {string}
   * @export
   */
  getStatefulSetDetailHref() {
    return this.state_.href(
        stateName,
        new StateParams(this.statefulSet.objectMeta.namespace, this.statefulSet.objectMeta.name));
  }

  /**
   * Returns true if any of stateful set pods has warning, false otherwise
   * @return {boolean}
   * @export
   */
  hasWarnings() {
    return this.statefulSet.pods.warnings.length > 0;
  }

  /**
   * Returns true if stateful set pods have no warnings and there is at least one pod
   * in pending state, false otherwise
   * @return {boolean}
   * @export
   */
  isPending() {
    return !this.hasWarnings() && this.statefulSet.pods.pending > 0;
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
   * @param  {string} creationDate - creation date of the stateful set
   * @return {string} localized tooltip with the formated creation date
   */
  getCreatedAtTooltip(creationDate) {
    let filter = this.interpolate_(`{{date | date}}`);
    /** @type {string} @desc Tooltip 'Created at [some date]' showing the exact creation time of
     * stateful set. */
    let MSG_STATEFUL_SET_LIST_CREATED_AT_TOOLTIP =
        goog.getMsg('Created at {$creationDate}', {'creationDate': filter({'date': creationDate})});
    return MSG_STATEFUL_SET_LIST_CREATED_AT_TOOLTIP;
  }
}

/**
 * @type {!angular.Component}
 */
export const statefulSetCardComponent = {
  bindings: {
    'statefulSet': '=',
    'showResourceKind': '<',
  },
  controller: StatefulSetCardController,
  templateUrl: 'statefulset/list/card.html',
};
