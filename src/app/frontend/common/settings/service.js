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
 * @final
 */
export class SettingsService {
  /**
   * @param {!angular.$resource}  $resource
   * @param {!angular.$log}  $log
   * @ngInject
   */
  constructor($resource, $log) {
    /** @private {!angular.$resource} */
    this.resource_ = $resource;

    /** @private {!angular.$log} */
    this.log_ = $log;

    /** @private {undefined|!backendApi.Settings} */
    this.global_ = undefined;

    /** @private {boolean} */
    this.isResourceLoaded_ = false;
  }

  /**
   * Loads the data from the backend. Must be called at least once before usage.
   * Should be called after settings change.
   */
  load() {
    this.resource_('api/v1/settings/global')
        .get(
            (global) => {
              this.global_ = global;
              this.isResourceLoaded_ = true;
              this.log_.info('Reloaded global settings: ', global);
            },
            (err) => {
              this.log_.info('Error during global settings reload: ', err);
            });
  }

  /**
   * @return {boolean}
   * @private
   */
  isInitialized_() {
    return this.isResourceLoaded_ && this.global_ !== undefined;
  }

  /**
   * Gets currently loaded cluster name parameter. To load changes from the backend use load()
   * function.
   *
   * @export
   * @return {string}
   */
  getClusterName() {
    let clusterName = '';
    if (this.isInitialized_()) {
      clusterName = this.global_.clusterName;
    }
    return clusterName;
  }

  /**
   * Gets currently loaded items per page parameter. To load changes from the backend use load()
   * function.
   *
   * @export
   * @return {number}
   */
  getItemsPerPage() {
    let itemsPerPage = 10;
    if (this.isInitialized_()) {
      itemsPerPage = this.global_.itemsPerPage;
    }
    return itemsPerPage;
  }

  /**
   * Gets currently loaded auto refresh time interval parameter. To load changes from the backend
   * use load() function.
   *
   * @export
   * @return {number}
   */
  getAutoRefreshTimeInterval() {
    let autoRefreshTimeInterval = 5;
    if (this.isInitialized_()) {
      autoRefreshTimeInterval = this.global_.autoRefreshTimeInterval;
    }
    return autoRefreshTimeInterval;
  }
}
