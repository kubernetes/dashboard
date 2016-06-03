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

import {StateParams} from 'petsetdetail/petsetdetail_state';
import {stateName} from 'petsetdetail/petsetdetail_state';

/**
 * Controller for the pet set card.
 *
 * @final
 */
export default class PetSetCardController {
  /**
   * @param {!ui.router.$state} $state
   * @ngInject
   */
  constructor($state) {
    /**
     * Initialized from the scope.
     * @export {!backendApi.PetSet}
     */
    this.petSet;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @export */
    this.i18n = i18n;
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
}

/**
 * @return {!angular.Component}
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
};
