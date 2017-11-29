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

import {stateName as deployState} from '../deploy/state';
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
   * @param {!angular.$resource} $resource
   * @param {!angular.$sce} $sce
   * @ngInject
   */
  constructor($state, $timeout, $transitions, $resource, $sce) {
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

    /** @private {!angular.$resource} */
    this.resource_ = $resource;

    /** @private {!angular.$sce} */
    this.sce_ = $sce;

    /** @private {!backendApi.SystemBanner} */
    this.systemBanner_;
  }

  /** @export */
  $onInit() {
    this.registerStateChangeListeners();
    this.initSystemBanner_();
  }

  /**
   * @private
   */
  initSystemBanner_() {
    this.resource_('api/v1/systembanner').get((sb) => {
      this.systemBanner_ = sb;
    });
  }

  /**
   * @export
   * @return {boolean}
   */
  isSystemBannerVisible() {
    return this.systemBanner_ !== undefined && this.systemBanner_.message.length > 0;
  }

  /**
   * @export
   * @return {string}
   */
  getSystemBannerClass() {
    if (this.systemBanner_ && this.systemBanner_.severity) {
      return `kd-system-banner-${this.systemBanner_.severity.toLowerCase()}`;
    }
    return '';
  }

  /**
   * @export
   * @return {*}
   */
  getSystemBannerMessage() {
    if (this.isSystemBannerVisible()) {
      return this.sce_.trustAsHtml(this.systemBanner_.message);
    }
    return '';
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
    this.state_.go(deployState);
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
