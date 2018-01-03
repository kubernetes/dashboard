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
   * @param {!./common/settings/service.SettingsService} kdSettingsService
   * @ngInject
   */
  constructor($interpolate, kdFutureStateService, kdBreadcrumbsService, kdSettingsService) {
    /** @private {!./common/state/service.FutureStateService} */
    this.futureStateService_ = kdFutureStateService;

    /** @private {!./common/components/breadcrumbs/service.BreadcrumbsService} */
    this.kdBreadcrumbsService_ = kdBreadcrumbsService;

    /** @private {!./common/settings/service.SettingsService} */
    this.settingsService_ = kdSettingsService;

    /** @private {!angular.$interpolate} */
    this.interpolate_ = $interpolate;

    /** @private {string} */
    this.defaultTitle_ = 'Kubernetes Dashboard';
  }

  /**
   * Returns title of browser window based on current state's breadcrumb label and cluster name set
   * in settings.
   *
   * @export
   * @return {string}
   */
  title() {
    let windowTitle = '';

    let clusterName = this.settingsService_.getClusterName();
    if (clusterName) {
      windowTitle += `${clusterName} - `;
    }

    let conf = this.kdBreadcrumbsService_.getBreadcrumbConfig(this.futureStateService_.state);
    if (conf && conf.label) {
      let params = this.futureStateService_.params;
      let stateLabel = this.interpolate_(conf.label)({'$stateParams': params}).toString();
      windowTitle += `${stateLabel} - `;
    }

    windowTitle += this.defaultTitle_;
    return windowTitle;
  }
}
