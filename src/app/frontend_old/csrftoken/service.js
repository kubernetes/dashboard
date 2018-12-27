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
export class CsrfTokenService {
  /**
   * @param {!angular.$resource} $resource
   * @ngInject
   */
  constructor($resource) {
    /** @private {!angular.$resource} */
    this.resource_ = $resource;
  }

  /**
   * Get a CSRF token resource for an action you want to perform
   * @param {string} action to get token for
   * @return {!angular.$q.Promise}
   * @private
   */
  getTokenResource_(action) {
    return this.resource_(`api/v1/csrftoken/${action}`).get().$promise;
  }

  /**
   * Get a CSRF token for an action you want to perform
   * @param {string} action to get token for
   * @return {!angular.$q.Promise}
   */
  getTokenForAction(action) {
    return this.getTokenResource_(action).then(this.onTokenResponse_);
  }

  /**
   * @param {!backendApi.CsrfToken} csrfToken
   * @return {string}
   * @private
   */
  onTokenResponse_(csrfToken) {
    return csrfToken.token;
  }
}
