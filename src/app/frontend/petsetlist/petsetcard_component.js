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
 * Controller for the pet set card.
 *
 * @final
 */
export default class PetSetCardController {
  /**
   * @ngInject
   */
  constructor() {
    /**
     * Initialized from the scope.
     * @export {!backendApi.PetSet}
     */
    this.petSet;
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
