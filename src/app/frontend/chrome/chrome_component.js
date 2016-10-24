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

import {fillContentConfig} from 'chrome/chrome_state';

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
   * @param {!angular.$timeout} $timeout
   * @ngInject
   */
  constructor($state, $scope, $timeout) {
    /**
     * By default this is true to show loading spinner for the first page.
     * @export {boolean}
     */
    this.showLoadingSpinner = true;

    /**
     * By default this is true to show loading for the first page.
     * @export {boolean}
     */
    this.loading = true;

    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @private {!angular.Scope} */
    this.scope_ = $scope;

    /** @private {!angular.$timeout} */
    this.timeout_ = $timeout;
  }

  /** @export */
  $onInit() {
    this.registerStateChangeListeners(this.scope_);
  }

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
  isFillContentView() {
    return this.state_.current.data[fillContentConfig] === true;
  }

  /**
   * @param {!angular.Scope} scope
   */
  registerStateChangeListeners(scope) {
    scope.$on('$stateChangeStart', () => {
      this.loading = true;
      this.showLoadingSpinner = false;
      // Show loading spinner after X ms, only for long-loading pages. This is to avoid flicker
      // for pages that load instantaneously.
      this.timeout_(() => {
        this.showLoadingSpinner = true;
      }, 250);
    });

    scope.$on('$stateChangeError', this.hideSpinner_.bind(this));
    scope.$on('$stateChangeSuccess', this.hideSpinner_.bind(this));
  }

  /**
   * @private
   */
  hideSpinner_() {
    this.loading = false;
    this.showLoadingSpinner = false;
  }
}

/**
 * @type {!angular.Component}
 */
export const chromeComponent = {
  controller: ChromeController,
  templateUrl: 'chrome/chrome.html',
};
