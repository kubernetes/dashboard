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
class LoginController {
  /**
   * @param {!./../chrome/nav/nav_service.NavService} kdNavService
   * @ngInject
   */
  constructor(kdNavService, kdAuthService, $state) {
    /** @private {!./../chrome/nav/nav_service.NavService} */
    this.kdNavService_ = kdNavService;
    this.kdAuthService_ = kdAuthService;
    this.state_ = $state;
    this.error;

    /**
     * Hide side menu while entering login page.
     */
    this.kdNavService_.setVisibility(false);

    /**
     * Initialized from the template.
     * @export {!angular.FormController}
     */
    this.form;

    this.loginSpec;
  }

  $onInit() {
    this.loginSpec = {};
  }

  update(loginSpec) {
    this.loginSpec.username = this.getValue(this.loginSpec.username, loginSpec.username);
    this.loginSpec.password = this.getValue(this.loginSpec.password, loginSpec.password);
    this.loginSpec.token = this.getValue(this.loginSpec.token, loginSpec.token);
  }

  getValue(oldVal, newVal) {
    return oldVal !== newVal && newVal !== undefined ? newVal : oldVal;
  }

  /**
   * @export
   */
  logIn() {
    if (this.form.$valid) {
      this.kdAuthService_.logIn(this.loginSpec)
          .then(
              () => {
                this.kdNavService_.setVisibility(true);
                this.state_.transitionTo('workload');
              },
              err => {
                this.error = err.data;
              });
    }
  }

  /**
   * @export
   */
  skip() {
    this.kdAuthService_.skipLoginPage(true);
    this.kdNavService_.setVisibility(true);
    this.state_.transitionTo('workload');
  }
}

export const loginComponent = {
  templateUrl: 'login/login.html',
  controller: LoginController,
};
