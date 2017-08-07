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
   * @param {!./../common/auth/service.AuthService} kdAuthService
   * @ngInject
   */
  constructor(kdAuthService) {
    /** @private {!./../common/auth/service.AuthService} */
    this.kdAuthService_ = kdAuthService;
  }

  /**
   * TODO
   * @returns {string}
   */
  getAuthStatus() {
    return 'logged in with token';
  }

  /**
   * TODO
   * @returns {*}
   */
  isAuthSkipped() {
    console.log(this.kdAuthService_.isLoginPageEnabled());
    return this.kdAuthService_.isLoginPageEnabled();
  }

  /**
   * TODO
   */
  goToLoginPage() {
    this.kdAuthService_.skipLoginPage(false);
  }
}

/**
 * @type {!angular.Component}
 */
export const authComponent = {
  controller: AuthController,
  templateUrl: 'chrome/auth/auth.html',
};
