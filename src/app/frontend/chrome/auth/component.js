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
 * @final
 */
export class AuthController {
  /**
   * @param {!ui.router.$state} $state
   * @param {!./../../common/auth/service.AuthService} kdAuthService
   * @ngInject
   */
  constructor($state, kdAuthService) {
    /** @private {!ui.router.$state} */
    this.state_ = $state;

    /** @private {!./../common/auth/service.AuthService} */
    this.kdAuthService_ = kdAuthService;
  }

  /**
   * Returns current authentication status string.
   *
   * @return {string}
   * @export
   */
  getAuthStatus() {
    return 'Logged in with token';  // TODO(maciaszczykm)
  }

  /**
   * Checks if authentication was skipped and default service account is used.
   *
   * @return {boolean}
   * @export
   */
  isAuthSkipped() {
    return !this.kdAuthService_.isLoginPageEnabled();
  }

  /**
   * Checks if user is logged in using Dashboard log in mechanism.
   *
   * @return {boolean}
   */
  isLoggedIn() {
    return true;  // TODO(maciaszczykm)
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
export const authComponent = {
  controller: AuthController,
  templateUrl: 'chrome/auth/auth.html',
};
