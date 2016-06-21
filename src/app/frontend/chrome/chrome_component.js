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

import {showZeroState} from 'common/components/zerostate/zerostate_component';
import {stateName as workloadState} from 'workloads/workloads_state';

import {actionbarViewName} from './chrome_state';

/**
 * Controller for the chrome directive.
 *
 * @final
 */
export class ChromeController {
  /**
   * @param {!ui.router.$state} $state
   * @param {!angular.Scope} $scope
   * @ngInject
   */
  constructor($state, $scope) {
    /**
     * By default this is true to show loading for the first page.
     * @export {boolean}
     */
    this.showLoadingSpinner = true;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @private {!angular.Scope} */
    this.scope_ = $scope;
  }

  /** @export */
  $onInit() { this.registerStateChangeListeners(this.scope_); }

  /**
   * @return {string}
   * @export
   */
  getLogoHref() { return this.state_.href(workloadState); }

  /**
   * @return {boolean}
   * @export
   */
  isActionbarVisible() {
    return !!this.state_.current && !!this.state_.current.views &&
        !!this.state_.current.views[actionbarViewName] && !this.showLoadingSpinner;
  }

  /**
   * @return {boolean}
   * @export
   */
  isZeroStateVisible() {
    return !!this.state_.current && !!this.state_.current.data &&
        !!this.state_.current.data[showZeroState];
  }

  /**
   * @param {!angular.Scope} scope
   */
  registerStateChangeListeners(scope) {
    scope.$on('$stateChangeStart', () => { this.showLoadingSpinner = true; });

    scope.$on('$stateChangeError', this.hideSpinner_.bind(this));
    scope.$on('$stateChangeSuccess', this.hideSpinner_.bind(this));
  }

  /**
   * @private
   */
  hideSpinner_() { this.showLoadingSpinner = false; }
}

/**
 * @type {!angular.Component}
 */
export const chromeComponent = {
  controller: ChromeController,
  templateUrl: 'chrome/chrome.html',
};
