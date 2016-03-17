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

/**
 * Application config.
 *
 * @final
 */
export default class AppConfig {
  /**
   * @param {!angular.$resource} $resource
   * @ngInject
   */
  constructor($resource) {
    /** @private {!angular.$resource} */
    this.resource_ = $resource;

    /** @private {!angular.$q.Promise} */
    this.currentServerTime_ = this.resolveServerTime_();
  }

  /**
   * Resolves current server time.
   *
   * @return {!angular.$q.Promise}
   * @private
   */
  resolveServerTime_() {
    /** @type {!angular.Resource<!backendApi.ServerTime>} */
    let resource = this.resource_('api/v1/time');
    return resource.get().$promise;
  }

  /**
   * Resolves current server time.
   *
   * @return {!angular.$q.Promise}
   * @export
   */
  getCurrentServerTime() { return this.currentServerTime_; }
}
