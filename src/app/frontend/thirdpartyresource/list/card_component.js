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
import {stateName} from 'thirdpartyresource/detail/state';

class ThirdPartyResourceCardController {
  /**
   * @param {!ui.router.$state} $state
   * @param {!angular.$interpolate} $interpolate
   * @ngInject
   */
  constructor($state, $interpolate) {
    /**
     * Initialized from the scope.
     * @export {!backendApi.ThirdPartyResource}
     */
    this.thirdPartyResource;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @private */
    this.interpolate_ = $interpolate;
  }

  /**
   * @export
   * @return {string}
   */
  getThirdPartyResourceDetailHref() {
    return this.state_.href(
        stateName, new StateParams('', this.thirdPartyResource.objectMeta.name));
  }

  /**
   * @export
   * @param  {string} creationDate - creation date of the third party resource
   * @return {string} localized tooltip with the formatted creation date
   */
  getCreatedAtTooltip(creationDate) {
    let filter = this.interpolate_(`{{date | date}}`);
    /** @type {string} @desc Tooltip 'Created at [some date]' showing the exact creation time of
     * third party resource. */
    let MSG_THIRD_PARTY_RESOURCE_LIST_CREATED_AT_TOOLTIP =
        goog.getMsg('Created at {$creationDate}', {'creationDate': filter({'date': creationDate})});
    return MSG_THIRD_PARTY_RESOURCE_LIST_CREATED_AT_TOOLTIP;
  }
}

/**
 * @type {!angular.Component}
 */
export const thirdPartyResourceCardComponent = {
  bindings: {
    'thirdPartyResource': '=',
  },
  controller: ThirdPartyResourceCardController,
  templateUrl: 'thirdpartyresource/list/card.html',
};
