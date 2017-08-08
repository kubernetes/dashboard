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

/** @final */
export class AuthService {
  /**
   * @param {!angular.$cookies} $cookies
   * @param {!kdUiRouter.$transitions} $transitions
   * @param {!./../csrftoken/service.CsrfTokenService} kdCsrfTokenService
   * @param {!angular.$log} $log
   * @param {!kdUiRouter.$state} $state
   * @param {!angular.$q} $q
   * @param {!angular.$resource} $resource
   * @param {string} kdTokenCookieName
   * @param {string} kdTokenHeaderName
   * @param {string} kdCsrfTokenHeader
   * @ngInject
   */
  constructor(
      $cookies, $transitions, kdCsrfTokenService, $log, $state, $q, $resource, kdTokenCookieName,
      kdTokenHeaderName, kdCsrfTokenHeader) {
    /** @private {!angular.$cookies} */
    this.cookies_ = $cookies;
    /** @private {!kdUiRouter.$transitions} */
    this.transitions_ = $transitions;
    /** @private {!./../csrftoken/service.CsrfTokenService} */
    this.csrfTokenService_ = kdCsrfTokenService;
    /** @private {!angular.$log} */
    this.log_ = $log;
    /** @private {!kdUiRouter.$state} */
    this.state_ = $state;
    /** @private {!angular.$q} */
    this.q_ = $q;
    /** @private {!angular.$resource} */
    this.resource_ = $resource;
    /** @private {string} */
    this.tokenCookieName_ = kdTokenCookieName;
    /** @private {string} */
    this.tokenHeaderName_ = kdTokenHeaderName;
    /** @private {string} */
    this.csrfHeaderName_ = kdCsrfTokenHeader;
    /** @private {string} */
    this.skipLoginPageCookieName_ = 'skipLoginPage';
  }

  /**
   * @param {string} token
   * @private
   */
  setTokenCookie_(token) {
    this.cookies_.put(this.tokenCookieName_, token);
  }

  /**
   * Cleans cookies, but does not remove them.
   */
  cleanAuthCookies() {
    this.setTokenCookie_('');
    this.skipLoginPage(false);
  }

  /**
   * Sends a login request to the backend with filled in login spec structure.
   *
   * @param {!backendApi.LoginSpec} loginSpec
   */
  login(loginSpec) {
    let deferred = this.q_.defer();

    /** @type {!angular.$q.Promise} */
    let csrfTokenPromise = this.csrfTokenService_.getTokenForAction('login');
    csrfTokenPromise.then(
        (csrfToken) => {
          let resource = this.resource_('api/v1/login', {}, {
            save: {
              method: 'POST',
              headers: {
                [this.csrfHeaderName_]: csrfToken,
              },
            },
          });

          resource.save(
              loginSpec,
              (/** @type {!backendApi.LoginResponse} */ response) => {
                if (response.jweToken.length !== 0 && response.errors.length === 0) {
                  this.setTokenCookie_(response.jweToken);
                }

                deferred.resolve(response.errors);
              },
              (err) => {
                deferred.reject(err);
              });
        },
        (err) => {
          deferred.reject(err);
        });

    return deferred.promise;
  }

  /**
   * Cleans cookies and goes to login page.
   */
  logout() {
    this.cleanAuthCookies();
    this.state_.go(loginState);
  }

  /**
   * Returns promise that returns TargetState once backend decides whether user is logged in or not.
   * User is then redirected to target state (if logged in) or to login page.
   *
   * In order to determine if user is logged in one of below factors have to be fulfilled:
   *  - valid jwe token has to be present in a cookie (named 'kdToken')
   *  - authorization header has to be present in request to dashboard ('Authorization: Bearer
   * <token>')
   *
   * @param {!kdUiRouter.$transition$} transition
   * @return {!angular.$q.Promise}
   */
  isLoggedIn(transition) {
    let deferred = this.q_.defer();

    // Skip log in check if user is going to login page already or has chosen to skip it.
    if (!this.isLoginPageEnabled() || transition.to().name === loginState ||
        transition.to().name === 'internalerror') {
      deferred.resolve(true);
      return deferred.promise;
    }

    this.getLoginStatus().then(
        (/** @type {!backendApi.LoginStatus} */ loginStatus) => {
          if (loginStatus.headerPresent || loginStatus.tokenPresent) {
            deferred.resolve(true);
            return;
          }

          deferred.resolve(this.state_.target(loginState));
        },
        (err) => {
          this.log_.error(err);
          // In case of error let the transition to continue.
          deferred.resolve(true);
        });

    return deferred.promise;
  }

  /**
   * @return {!angular.$q.Promise}
   */
  getLoginStatus() {
    let token = this.cookies_.get(this.tokenCookieName_) || '';
    return this
        .resource_('api/v1/login/status', {}, {
          get: {
            method: 'GET',
            headers: {
              [this.tokenHeaderName_]: token,
            },
          },
        })
        .get()
        .$promise;
  }

  /**
   * @param {boolean} skip
   */
  skipLoginPage(skip) {
    this.cookies_.put(this.skipLoginPageCookieName_, skip.toString());
  }

  /**
   * Returns true if user has selected to skip page, false otherwise.
   * As cookie returns string or undefined we have to check for a string match.
   * In case cookie is not set login page will also be visible.
   *
   * @return {boolean}
   */
  isLoginPageEnabled() {
    return !(this.cookies_.get(this.skipLoginPageCookieName_) === 'true');
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
