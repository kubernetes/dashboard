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

import {stateName as loginState} from 'login/state';

/**
 * @final
 */
export class AuthService {
  /**
   * @ngInject
   */
  constructor($cookies, $transitions, kdCsrfTokenService, $log, $state, $q, $resource) {
    this.cookies_ = $cookies;
    this.transitions_ = $transitions;
    this.state_ = $state;
    /** @private {!angular.$q.Promise} */
    this.tokenPromise_ = kdCsrfTokenService.getTokenForAction('login');
    this.q_ = $q;
    this.resource_ = $resource;
    this.jwtCookieName_ = 'kdToken';
    this.skipLoginPageCookieName = 'skipLoginPage';
    this.log_ = $log;
  }

  setJWTCookie(token) {
    this.cookies_.put(this.jwtCookieName_, token)
  }

  /**
   *
   * @param {!backendApi.LoginSpec} loginSpec
   */
  logIn(loginSpec) {
    let deferred = this.q_.defer();

    this.tokenPromise_.then(
        token => {
          let resource = this.resource_('api/v1/login', {}, {
            save: {
              method: 'POST',
              headers: {
                'X-CSRF-TOKEN': token,
              },
            },
          });

          resource.save(
              loginSpec,
              response => {
                console.log(response);
                if (!!response.jwtToken) {
                  console.log(response.jwtToken);
                  this.setJWTCookie(response.jwtToken);
                  deferred.resolve();
                }

                deferred.reject('Got empty token');
              },
              err => {
                deferred.reject(err);
              })
        },
        err => {
          deferred.reject(err);
          console.log(err);
        });

    return deferred.promise;
  }

  /**
   * Returns promise that returns TargetState once backend decides whether user is logged in or not.
   * User is then redirected to target state (if logged in) or to login page.
   *
   * In order to determine if user is logged in one of below factors have to be fulfilled:
   *  - valid jwt token has to be present in a cookie (named 'kdToken')
   *  - authorization header has to be present in request to dashboard ('Authorization: Bearer
   * <token>')
   *
   * @param {} transition
   * @return {!angular.$q.Promise}
   */
  isLoggedIn(transition) {
    let deferred = this.q_.defer(), jwtCookie = this.cookies_.get(this.jwtCookieName_) || '',
        resource = this.resource_('api/v1/login/status', {}, {
          get: {
            method: 'GET',
            headers: {
              [this.jwtCookieName_]: jwtCookie,
            }
          }
        });

    // Skip log in check if user is going to login page already or has chosen to skip it.
    if (!this.isLoginPageEnabled() || transition.$to().name === loginState) {
      deferred.resolve(true);
      return deferred.promise;
    }

    resource.get(
        (loginStatus) => {
          if (loginStatus.headerPresent || loginStatus.tokenPresent) {
            return deferred.resolve(true);
          }

          return deferred.resolve(this.state_.target(loginState));
        },
        (err) => {
          this.log_.error(err);
          // In case of error let the transition to continue.
          return deferred.resolve(true);
        });

    return deferred.promise;
  }

  /**
   *
   * @param {boolean} skip
   */
  skipLoginPage(skip) {
    this.cookies_.put(this.skipLoginPageCookieName, skip);
  }

  /**
   * Returns true if user has selected to skip page, false otherwise.
   * As cookie returns string or undefined we have to check for string match with type conversion.
   * In case cookie is not set login page will also be visible.
   *
   * @return {boolean}
   */
  isLoginPageEnabled() {
    return !(this.cookies_.get(this.skipLoginPageCookieName) == 'true');
  }

  /**
   * Initializes the service to track state changes and make sure that user is logged in and
   * token has not expired.
   */
  init() {
    this.transitions_.onBefore({}, (transition) => {
      return this.isLoggedIn(transition);
    }, {priority: 10});
  }
}