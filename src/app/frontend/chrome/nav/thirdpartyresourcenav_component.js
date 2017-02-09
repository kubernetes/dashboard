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

import {stateName as thirdPartyResourceState} from 'thirdpartyresourcelist/list_state';

/**
 * @final
 */
export class ThirdPartyResourceNavController {
  /**
   * @param
   * {!./../../common/thirdpartyresource/thirdpartyresource_service.ThirdPartyResourceService}
   * kdThirdPartyResourceService
   * @ngInject
   */
  constructor(kdThirdPartyResourceService) {
    /** @private
     * {!./../../common/thirdpartyresource/thirdpartyresource_service.ThirdPartyResourceService}
     * kdThirdPartyResourceService
     */
    this.kdThirdPartyResourceService_ = kdThirdPartyResourceService;

    /** @export {!backendApi.ThirdPartyResourceList} */
    this.thirdPartyResourceList;

    /** @export {!Object<string, string>} - Initialized from binding. */
    this.states;
  }

  /** @export */
  $onInit() {
    this.thirdPartyResourceList = this.kdThirdPartyResourceService_.getThirdPartyResourceList();

    if (this.shouldShowThirdPartyResources()) {
      // Add link to third party resource list state
      Object.assign(this.states, {'thirdpartyresource': thirdPartyResourceState});
    }
  }

  /** @export */
  shouldShowThirdPartyResources() {
    return this.kdThirdPartyResourceService_.areThirdPartyResourcesRegistered();
  }
}

/**
 * @type {!angular.Component}
 */
export const thirdPartyResourceNavComponent = {
  controller: ThirdPartyResourceNavController,
  templateUrl: 'chrome/nav/thirdpartyresourcenav.html',
  bindings: {
    'states': '=',
  },
};
