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

import {stateName as thirdPartyResourceDetailState} from 'thirdpartyresource/detail/state';
import {stateName as thirdPartyResourceState} from 'thirdpartyresource/list/state';

/**
 * @final
 */
export class ThirdPartyResourceNavController {
  /**
   * @param {!ui.router.$state} $state
   * @param {!angular.$resource} $resource
   * @param {!./../../common/state/service.FutureStateService} kdFutureStateService
   * @ngInject
   */
  constructor($state, $resource, kdFutureStateService) {
    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @private {!angular.$resource} */
    this.resource_ = $resource;

    /** @private {!./../../common/state/service.FutureStateService} */
    this.kdFutureStateService_ = kdFutureStateService;

    /** @export */
    this.isVisible = false;

    /**
     * Initialized from binding.
     *
     * @export {!Object<string, string>}
     */
    this.states;
  }

  /**
   * Resolve list of available third party resources to fill menu with entries.
   *
   * @export
   */
  $onInit() {
    this.resource_('api/v1/thirdpartyresource').get().$promise.then((result) => {
      if (result && result.thirdPartyResources && result.thirdPartyResources.length > 0) {
        Object.assign(this.states, {'thirdpartyresource': thirdPartyResourceState});
        this.isVisible = true;
      }
    });
  }

  /**
   * Returns true if third party resource state is active and menu entry should be highlighted.
   *
   * @return {boolean}
   * @export
   */
  isGroupActive() {
    return this.kdFutureStateService_.state.name === thirdPartyResourceState ||
        this.kdFutureStateService_.state.name === thirdPartyResourceDetailState;
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
