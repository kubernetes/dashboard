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

import {stateName, StateParams} from '../../error/state';
import {kdLocalizedErrors} from '../errorhandling/errors';

/** @final */
export class AuthorizerService {
  /**
   * @param {!angular.$resource} $resource
   * @param {!kdUiRouter.$state} $state
   * @ngInject
   */
  constructor($resource, $state) {
    /** @private {!angular.$resource} */
    this.resource_ = $resource;
    /** @private {!kdUiRouter.$state} */
    this.state_ = $state;
    /** @private {string} */
    this.authorizationSubUrl_ = '/cani';
  }

  /**
   * @param {string} url
   * @return {!angular.$q.Promise}
   */
  proxyGET(url) {
    return this.resource_(`${url}${this.authorizationSubUrl_}`)
        .get()
        .$promise.then(
            (/** @type {!backendApi.CanIResponse} */ response) => {
              if (response.allowed) {
                return this.resource_(url).get().$promise;
              }

              this.state_.go(stateName, this.getAccessForbiddenError());
            },
            (err) => {
              this.state_.go(stateName, new StateParams(err.detail, ''));
            });
  }

  /** @return {!Object} */
  getAccessForbiddenError() {
    return {
      error: {
        statusText: kdLocalizedErrors.MSG_FORBIDDEN_TITLE_ERROR,
        status: 403,
        data: kdLocalizedErrors.MSG_FORBIDDEN_ERROR,
      },
    };
  }
}
