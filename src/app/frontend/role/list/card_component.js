// Copyright 2017 Google Inc. All Rights Reserved.
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
 * Controller for the RBAC role card.
 *
 * @final
 */
export default class RoleCardController {
  /**
   * @param {!ui.router.$state} $state
   * @param {!angular.$interpolate} $interpolate
   * @ngInject
   */
  constructor($state, $interpolate) {
    /**
     * Initialized from the scope.
     * @export {!backendApi.Role}
     */
    this.role;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @private */
    this.interpolate_ = $interpolate;
  }

  /**
   * @export
   * @param  {string} startDate - start date of the role
   * @return {string} localized tooltip with the formatted start date
   */
  getStartedAtTooltip(startDate) {
    let filter = this.interpolate_(`{{date | date}}`);
    /** @type {string} @desc Tooltip 'Started at [some date]' showing the exact start time of
     * the role.*/
    let MSG_ROLE_LIST_STARTED_AT_TOOLTIP =
        goog.getMsg('Created at {$startDate} UTC', {'startDate': filter({'date': startDate})});
    return MSG_ROLE_LIST_STARTED_AT_TOOLTIP;
  }
}

/**
 * @return {!angular.Component}
 */
export const roleCardComponent = {
  bindings: {
    'role': '=',
  },
  controller: RoleCardController,
  templateUrl: 'role/list/card.html',
};
