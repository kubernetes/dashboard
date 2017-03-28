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
 * @final
 */
export class ObjectCardController {
  /**
   * @ngInject
   * @param {!ui.router.$state} $state
   * @param {!angular.$interpolate} $interpolate
   */
  constructor($state, $interpolate) {
    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @private {!angular.$interpolate} */
    this.interpolate_ = $interpolate;

    /**
     * Initialized from the scope.
     * @export {!backendApi.ThirdPartyResourceObject}
     */
    this.object;
  }

  /**
   * @export
   * @param  {string} startDate
   * @return {string} localized tooltip with the formated start date
   */
  getStartedAtTooltip(startDate) {
    let filter = this.interpolate_(`{{date | date}}`);
    /** @type {string} @desc Tooltip 'Started at [some date]' showing the exact creation time of
     * third party resource object. */
    let MSG_TPR_LIST_STARTED_AT_TOOLTIP =
        goog.getMsg('Started at {$startDate} UTC', {'startDate': filter({'date': startDate})});
    return MSG_TPR_LIST_STARTED_AT_TOOLTIP;
  }
}

/**
 * Definition object for the component that displays third party resource objects card.
 * @return {!angular.Component}
 */
export const objectCardComponent = {
  bindings: {
    'object': '=',
  },
  controller: ObjectCardController,
  templateUrl: 'thirdpartyresource/detail/objectcard.html',
};
