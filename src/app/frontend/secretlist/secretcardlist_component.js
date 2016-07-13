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
export class SecretCardListController {
  /**
   * @ngInject
   * @param {!angular.$interpolate} $interpolate
   */
  constructor($interpolate) {
    /**
     * List of secrets. Initialized from the scope.
     * @export {!backendApi.SecretList}
     */
    this.secretList;

    /** @private {!angular.$interpolate} */
    this.interpolate_ = $interpolate;

    /** @export */
    this.i18n = i18n;
  }

  /**
   * @export
   * @param  {string} startDate - start date of the pod
   * @return {string} localized tooltip with the formated start date
   */
  getStartedAtTooltip(startDate) {
    let filter = this.interpolate_(`{{date | date:'d/M/yy HH:mm':'UTC'}}`);
    /** @type {string} @desc Tooltip 'Started at [some date]' showing the exact start time of
     * the pod.*/
    let MSG_SECRET_LIST_STARTED_AT_TOOLTIP =
        goog.getMsg('Started at {$startDate} UTC', {'startDate': filter({'date': startDate})});
    return MSG_SECRET_LIST_STARTED_AT_TOOLTIP;
  }
}

/**
 * Definition object for the component that displays pods list card.
 *
 * @type {!angular.Component}
 */
export const secretCardListComponent = {
  templateUrl: 'secretlist/secretcardlist.html',
  controller: SecretCardListController,
  bindings: {
    /** {!backendApi.SecretList} */
    'secretList': '<',
  },
};

const i18n = {
  /** @export {string} @desc Label 'Name' which appears as a column label in the table of
   pods (pod list view). */
  MSG_SECRET_LIST_NAME_LABEL: goog.getMsg('Name'),
  /** @export {string} @desc Label 'Age' which appears as a column label in the
   table of pods (pod list view). */
  MSG_SECRET_LIST_AGE_LABEL: goog.getMsg('Age'),
};
