// Copyright 2017 The Kubernetes Dashboard Authors.
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
 * Controller to manage title of browser window.
 *
 * @final
 */
export class TitleController {
  /**
   * @param {!angular.$interpolate} $interpolate
   * @param {!./common/state/service.FutureStateService} kdFutureStateService
   * @param {!./common/components/breadcrumbs/service.BreadcrumbsService} kdBreadcrumbsService
   * @ngInject
   */
  constructor($interpolate, kdFutureStateService, kdBreadcrumbsService) {
    /** @private {!./common/state/service.FutureStateService} */
    this.transitions_ = kdFutureStateService;

    /** @private {!./common/components/breadcrumbs/service.BreadcrumbsService} */
    this.kdBreadcrumbsService_ = kdBreadcrumbsService;

    /** @private {!angular.$interpolate} */
    this.interpolate_ = $interpolate;

    /** @private {string} */
    this.defaultTitle_ = 'Kubernetes Dashboard';
  }

  /**
   * Returns title of browser window based on current state's breadcrumb label.
   *
   * @export
   * @return {string}
   */
  title() {
    let conf = this.kdBreadcrumbsService_.getBreadcrumbConfig(this.transitions_.state);

    // When conf is undefined or label is undefined or empty then fallback to default title
    if (!conf || !conf.label) {
      return this.defaultTitle_;
    }

    let params = this.transitions_.params;
    let stateLabel = this.interpolate_(conf.label)({'$stateParams': params}).toString();

    return `${stateLabel} - ${this.defaultTitle_}`;
  }
}
