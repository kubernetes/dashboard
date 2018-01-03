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
export class ControlPanelController {
  /**
   * @param {!angular.$log} $log
   * @param {!./../../common/auth/service.AuthService} kdAuthService
   * @ngInject
   */
  constructor($log, kdAuthService) {
    /** @private {!angular.$log} */
    this.log_ = $log;
    /** @private {!./../../common/auth/service.AuthService} */
    this.kdAuthService_ = kdAuthService;
    /** @private {!backendApi.LoginStatus} */
    this.loginStatus_;
    /** @export {boolean} */
    this.isLoginStatusLoaded = false;
  }

  /**
   * Checks if user is logged in using Dashboard log in mechanism and sets class variable after
   * backend responds.
   */
  $onInit() {
    this.kdAuthService_.getLoginStatus().then(
        (/** @type {!backendApi.LoginStatus} */ loginStatus) => {
          this.loginStatus_ = loginStatus;
          this.isLoginStatusLoaded = true;
        },
        (err) => {
          this.log_.error(err);
        });
  }

  /**
   * Returns current authentication status string.
   *
   * @return {string}
   * @export
   */
  getAuthStatus() {
    if (this.loginStatus_.headerPresent) {
      /** @type {string} @desc Login status displayed when authorization header is used. */
      let MSG_AUTH_STATUS_HEADER = goog.getMsg('Logged in with auth header');
      return MSG_AUTH_STATUS_HEADER;
    }
    if (this.loginStatus_.tokenPresent) {
      /** @type {string} @desc Login status displayed when token is used. */
      let MSG_AUTH_STATUS_TOKEN = goog.getMsg('Logged in with token');
      return MSG_AUTH_STATUS_TOKEN;
    }
    /** @type {string} @desc Login status displayed when default service account is used. */
    let MSG_AUTH_STATUS_SKIPPED = goog.getMsg('Default service account');
    return MSG_AUTH_STATUS_SKIPPED;
  }

  /**
   * Checks if authentication was skipped and default service account is used.
   *
   * @return {boolean}
   * @export
   */
  isAuthSkipped() {
    return !this.kdAuthService_.isLoginPageEnabled() && !this.loginStatus_.headerPresent;
  }

  /**
   * Checks if user is logged in. In case he is logged in using authorization header logout should
   * not be possible.
   *
   * @return {boolean}
   * @export
   */
  isLoggedIn() {
    return this.loginStatus_ && !this.loginStatus_.headerPresent && this.loginStatus_.tokenPresent;
  }

  /**
   * Checks if HTTPS is used.
   *
   * @return {boolean}
   * @export
   */
  isHttpsMode() {
    return this.loginStatus_ && this.loginStatus_.httpsMode;
  }

  /**
   * Logs out current user.
   *
   * @export
   */
  logout() {
    this.kdAuthService_.logout();
  }
}

/**
 * @type {!angular.Component}
 */
export const controlPanelComponent = {
  controller: ControlPanelController,
  templateUrl: 'chrome/controlpanel/controlpanel.html',
};
