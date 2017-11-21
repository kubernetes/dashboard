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

import {authRequired} from '../../chrome/state';
import {stateName as errorState} from '../../error/state';
import {stateName as loginState} from '../../login/state';
import {stateName as overviewState} from '../../overview/state';

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
    // This will only work for HTTPS connection
    this.cookies_.put(this.tokenCookieName_, token, {secure: true});
    // This will only work when accessing Dashboard at 'localhost' or '127.0.0.1'
    this.cookies_.put(this.tokenCookieName_, token, {domain: 'localhost'});
    this.cookies_.put(this.tokenCookieName_, token, {domain: '127.0.0.1'});
  }

  /**
   * @return {string}
   * @private
   */
  getTokenCookie_() {
    return this.cookies_.get(this.tokenCookieName_) || '';
  }

  /**
   * Remove auth cookies.
   */
  removeAuthCookies() {
    this.cookies_.remove(this.tokenCookieName_);
    this.cookies_.remove(this.skipLoginPageCookieName_);
  }

  /**
   * Sends a login request to the backend with filled in login spec structure.
   *
   * @param {!backendApi.LoginSpec} loginSpec
   * @return {!angular.$q.Promise}
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
              (/** @type {!backendApi.AuthResponse} */ response) => {
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
    this.removeAuthCookies();
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
    this.getLoginStatus().then(
        (/** @type {!backendApi.LoginStatus} */ loginStatus) => {
          // Do not allow entering login page if already authenticated or authentication is
          // disabled.
          if (transition.to().name === loginState &&
              (this.isAuthenticated(loginStatus) || !this.isAuthenticationEnabled(loginStatus))) {
            deferred.resolve(this.state_.target(overviewState));
            return;
          }

          // In following cases user should not be redirected and reach his target state:
          if (transition.to().name === loginState ||         // User is going to login page.
              transition.to().name === errorState ||         // User is going to error page.
              !this.isLoginPageEnabled() ||                  // User has chosen to skip login page.
              !this.isAuthenticationEnabled(loginStatus) ||  // Authentication is disabled.
              this.isAuthenticated(loginStatus))             // User is already authenticated.
          {
            deferred.resolve(true);
            return;
          }

          // In other cases redirect user to login state.
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
   * Sends a token refresh request to the backend. In case user is not logged in with token nothing
   * will happen.
   *
   * @return {!angular.$q.Promise}
   */
  refreshToken() {
    let token = this.getTokenCookie_();
    let deferred = this.q_.defer();

    if (token.length === 0) {
      deferred.resolve(true);
      return deferred.promise;
    }

    /** @type {!angular.$q.Promise} */
    let csrfTokenPromise = this.csrfTokenService_.getTokenForAction('token');
    csrfTokenPromise.then(
        (csrfToken) => {
          let resource = this.resource_('api/v1/token/refresh', {}, {
            save: {
              method: 'POST',
              headers: {
                [this.csrfHeaderName_]: csrfToken,
              },
            },
          });

          resource.save(
              /** !backendApi.TokenRefreshSpec */ {jweToken: token},
              (/** @type {!backendApi.AuthResponse} */ response) => {
                if (response.jweToken.length !== 0 && response.errors.length === 0) {
                  this.setTokenCookie_(response.jweToken);
                  deferred.resolve(response.jweToken);
                  return;
                }

                deferred.resolve(response.errors);
              },
              (err) => {
                deferred.resolve(err);
              });
        },
        (err) => {
          deferred.resolve(err);
        });

    return deferred.promise;
  }

  /**
   * Checks if user is authenticated.
   *
   * @param {!backendApi.LoginStatus} loginStatus
   * @return {boolean}
   */
  isAuthenticated(loginStatus) {
    return loginStatus.headerPresent || loginStatus.tokenPresent;
  }

  /**
   * Checks authentication is enabled. It is enabled only on HTTPS. Can be overridden by
   * 'enable-insecure-login' flag passed to dashboard.
   *
   * @param {!backendApi.LoginStatus} loginStatus
   * @return {boolean}
   */
  isAuthenticationEnabled(loginStatus) {
    return loginStatus.httpsMode;
  }

  /** @return {!angular.$q.Promise} */
  getLoginStatus() {
    let token = this.getTokenCookie_();
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
    this.removeAuthCookies();
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
    let requiresAuth = (state) => {
      return (state.data && state.data[authRequired] === true);
    };

    this.transitions_.onBefore({to: requiresAuth}, (transition) => {
      return this.isLoggedIn(transition);
    }, {priority: 10});

    this.transitions_.onBefore({to: requiresAuth}, () => {
      return this.refreshToken();
    });
  }
}
