// Copyright 2017 The Kubernetes Authors.
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

import {deployAppStateName} from '../deploy/state';
import {stateName as overviewState} from '../overview/state';

import {actionbarViewName, fillContentConfig} from './state';

/**
 * Controller for the chrome directive.
 *
 * @final
 */
export class ChromeController {
  /**
   * @param {!ui.router.$state} $state
   * @param {!angular.$timeout} $timeout
   * @param {!kdUiRouter.$transitions} $transitions
   * @ngInject
   */
  constructor($state, $timeout, $transitions) {
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

    /** @private {!angular.$timeout} */
    this.timeout_ = $timeout;

    /** @private {!kdUiRouter.$transitions} */
    this.transitions_ = $transitions;
  }

  /** @export */
  $onInit() {
    this.registerStateChangeListeners();
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
    return !!(this.state_.current.data && this.state_.current.data[fillContentConfig] === true);
  }

  registerStateChangeListeners() {
    this.transitions_.onStart({}, () => {
      this.loading = true;
      this.showLoadingSpinner = false;
      // Show loading spinner after X ms, only for long-loading pages. This is to avoid flicker
      // for pages that load instantaneously.
      this.timeout_(() => {
        this.showLoadingSpinner = true;
      }, 250);
    });

    this.transitions_.onError({}, this.hideSpinner_.bind(this));
    this.transitions_.onSuccess({}, this.hideSpinner_.bind(this));
  }

  /**
   * @private
   */
  hideSpinner_() {
    this.loading = false;
    this.showLoadingSpinner = false;
  }

  /**
   * @export
   */
  create() {
    this.state_.go(deployAppStateName);
  }

  /**
   * @return {string}
   * @export
   */
  getOverviewStateName() {
    return overviewState;
  }
}

/**
 * @type {!angular.Component}
 */
export const chromeComponent = {
  controller: ChromeController,
  templateUrl: 'chrome/chrome.html',
};
