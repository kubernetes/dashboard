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
import {stateName} from 'petsetdetail/petsetdetail_state';

/**
 * Controller for the pet set card.
 *
 * @final
 */
export default class PetSetCardController {
  /**
   * @param {!ui.router.$state} $state
   * @param {!angular.$interpolate} $interpolate
   * @param {!./../common/namespace/namespace_service.NamespaceService} kdNamespaceService
   * @ngInject
   */
  constructor($state, $interpolate, kdNamespaceService) {
    /**
     * Initialized from the scope.
     * @export {!backendApi.PetSet}
     */
    this.petSet;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @private */
    this.interpolate_ = $interpolate;

    /** @private {!./../common/namespace/namespace_service.NamespaceService} */
    this.kdNamespaceService_ = kdNamespaceService;

    /** @export */
    this.i18n = i18n;
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
  getPetSetDetailHref() {
    return this.state_.href(
        stateName, new StateParams(this.petSet.objectMeta.namespace, this.petSet.objectMeta.name));
  }

  /**
   * Returns true if any of pet set pods has warning, false otherwise
   * @return {boolean}
   * @export
   */
  hasWarnings() { return this.petSet.pods.warnings.length > 0; }

  /**
   * Returns true if pet set pods have no warnings and there is at least one pod
   * in pending state, false otherwise
   * @return {boolean}
   * @export
   */
  isPending() { return !this.hasWarnings() && this.petSet.pods.pending > 0; }

  /**
   * @return {boolean}
   * @export
   */
  isSuccess() { return !this.isPending() && !this.hasWarnings(); }

  /**
   * @export
   * @param  {string} creationDate - creation date of the pet set
   * @return {string} localized tooltip with the formated creation date
   */
  getCreatedAtTooltip(creationDate) {
    let filter = this.interpolate_(`{{date | date:'short'}}`);
    /** @type {string} @desc Tooltip 'Created at [some date]' showing the exact creation time of
     * pet set. */
    let MSG_PET_SET_LIST_CREATED_AT_TOOLTIP =
        goog.getMsg('Created at {$creationDate}', {'creationDate': filter({'date': creationDate})});
    return MSG_PET_SET_LIST_CREATED_AT_TOOLTIP;
  }
}

/**
 * @type {!angular.Component}
 */
export const petSetCardComponent = {
  bindings: {
    'petSet': '=',
  },
  controller: PetSetCardController,
  templateUrl: 'petsetlist/petsetcard.html',
};

const i18n = {
  /** @export {string} @desc Tooltip text which appears on error icon hover. */
  MSG_PET_SET_CARD_TOOLTIP_ERROR: goog.getMsg('One or more pods have errors'),
  /** @export {string} @desc Tooltip text which appears on pending icon hover. */
  MSG_PET_SET_CARD_TOOLTIP_PENDING: goog.getMsg('One or more pods are in pending state'),
  /** @export {string} @desc Label 'Pet Set' which will appear in the pet set
      delete dialog opened from a pet set card on the list page. */
  MSG_PET_SET_LIST_PET_SET_LABEL: goog.getMsg('Pet Set'),
};
