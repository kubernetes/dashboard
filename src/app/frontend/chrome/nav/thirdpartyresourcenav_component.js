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
import {stateName as thirdPartyResourceDetailState} from 'thirdpartyresourcedetail/detail_state';
import {StateParams} from 'common/resource/resourcedetail';

/**
 * @final
 */
export class ThirdPartyResourceNavController {
  /**
   * @param {!./../../common/thirdpartyresource/thirdpartyresource_service.ThirdPartyResourceService} kdThirdPartyResourceService
   * @param {!./../../common/state/futurestate_service.FutureStateService} kdFutureStateService
   * @ngInject
   */
  constructor($state, kdThirdPartyResourceService, kdFutureStateService) {
    /** @private {!./../../common/thirdpartyresource/thirdpartyresource_service.ThirdPartyResourceService} kdThirdPartyResourceService */
    this.kdThirdPartyResourceService_ = kdThirdPartyResourceService;

    /** @export {!backendApi.ThirdPartyResourceList} */
    this.thirdPartyResourceList;

    /** @export {!Object<string, string>} - Initialized from binding. */
    this.states;

    this.state_ = $state;

    /** @private {!./../../common/state/futurestate_service.FutureStateService} */
    this.kdFutureStateService_ = kdFutureStateService;
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

  /**
   * @return {string}
   * @export
   */
  getThirdPartyResourceDetailHref(thirdPartyResourceName) {
    return this.state_.href(thirdPartyResourceDetailState, new StateParams('', thirdPartyResourceName));
  }

  /**
   * Returns true if third party resource state is active and menu entry should be highlighted.
   *
   * @return {boolean}
   * @export
   */
  isGroupActive() {
    return this.kdFutureStateService_.state.name === thirdPartyResourceState;
  }

  /**
   * Returns true if current state is active and menu entry should be highlighted.
   *
   * @param {string} entry
   * @return {boolean}
   * @export
   */
  isActive(entry) {
    return this.kdFutureStateService_.state.name === thirdPartyResourceDetailState &&
        this.kdFutureStateService_.params.objectName === entry;
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
