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
import {stateName} from 'secret/detail/state';

class SecretCardController {
  /**
   * @param {!./../../common/namespace/service.NamespaceService} kdNamespaceService
   * @param {!angular.$interpolate} $interpolate
   * @param {!ui.router.$state} $state
   * @ngInject
   */
  constructor($interpolate, $state, kdNamespaceService) {
    /** @export {!backendApi.Secret} Secret initialised from a bindig. */
    this.secret;

    /** @private {!angular.$interpolate} */
    this.interpolate_ = $interpolate;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @private {!./../../common/namespace/service.NamespaceService} */
    this.kdNamespaceService_ = kdNamespaceService;
  }

  /**
   * @export
   * @param  {string} startDate - start date of the secret
   * @return {string} localized tooltip with the formated start date
   */
  getStartedAtTooltip(startDate) {
    let filter = this.interpolate_(`{{date | date}}`);
    /** @type {string} @desc Tooltip 'Started at [some date]' showing the exact start time of
     * the secret.*/
    let MSG_SECRET_LIST_STARTED_AT_TOOLTIP =
        goog.getMsg('Created at {$startDate} UTC', {'startDate': filter({'date': startDate})});
    return MSG_SECRET_LIST_STARTED_AT_TOOLTIP;
  }

  /**
   * @return {string}
   * @export
   */
  getSecretDetailHref() {
    return this.state_.href(
        stateName, new StateParams(this.secret.objectMeta.namespace, this.secret.objectMeta.name));
  }

  /**
   * @return {boolean}
   * @export
   */
  areMultipleNamespacesSelected() {
    return this.kdNamespaceService_.areMultipleNamespacesSelected();
  }
}

/**
 * @type {!angular.Component}
 */
export const secretCardComponent = {
  bindings: {
    'secret': '=',
  },
  controller: SecretCardController,
  templateUrl: 'secret/list/card.html',
};
