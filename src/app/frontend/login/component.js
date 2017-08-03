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

import {stateName as overviewState} from 'overview/state';
import LoginSpec from './spec';

/** @final */
class LoginController {
  /**
   * @param {!./../chrome/nav/nav_service.NavService} kdNavService
   * @param {!./../common/auth/service.AuthService} kdAuthService
   * @param {!ui.router.$state} $state
   * @param {!angular.$q} $q
   * @ngInject
   */
  constructor(kdNavService, kdAuthService, $state, $q) {
    /** @private {!./../chrome/nav/nav_service.NavService} */
    this.kdNavService_ = kdNavService;
    /** @private {!./../common/auth/service.AuthService} */
    this.kdAuthService_ = kdAuthService;
    /** @private {!ui.router.$state} */
    this.state_ = $state;
    /**
     * Initialized from the template.
     * @export {!angular.FormController}
     */
    this.form;
    /** @export {!backendApi.LoginSpec} */
    this.loginSpec;
    /** @private {!angular.$q} */
    this.q_ = $q;
    /** @private {!Array<!backendApi.Error>} */
    this.errors = [];
  }

  /** @export */
  $onInit() {
    this.loginSpec = new LoginSpec();
    /** Hide side menu while entering login page. */
    this.kdNavService_.setVisibility(false);
  }

  /**
   * @param {!backendApi.LoginSpec} loginSpec
   * @export
   */
  onUpdate(loginSpec) {
    this.loginSpec.username = this.getValue_(this.loginSpec.username, loginSpec.username);
    this.loginSpec.password = this.getValue_(this.loginSpec.password, loginSpec.password);
    this.loginSpec.token = this.getValue_(this.loginSpec.token, loginSpec.token);
  }

  /**
   * Returns new values if it differs from old value and is not undefined.
   *
   * @param {string} oldVal
   * @param {string} newVal
   * @return {string}
   * @private
   */
  getValue_(oldVal, newVal) {
    return oldVal !== newVal && newVal !== undefined ? newVal : oldVal;
  }

  /** @export */
  login() {
    if (this.form.$valid) {
      this.kdAuthService_.login(this.loginSpec).then((errors) => {
        if (errors.length > 0) {
          this.errors = errors;
          return;
        }

        this.kdNavService_.setVisibility(true);
        this.state_.transitionTo(overviewState);
      });
    }
  }

  /** @export */
  skip() {
    this.kdAuthService_.skipLoginPage(true);
    this.kdNavService_.setVisibility(true);
    this.state_.transitionTo(overviewState);
  }
}

/** @type {!angular.Component} */
export const loginComponent = {
  templateUrl: 'login/login.html',
  controller: LoginController,
};
