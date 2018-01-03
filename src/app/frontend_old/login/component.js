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

import {stateName as overviewState} from '../overview/state';
import LoginSpec from './spec';

/**
 * Should be kept in sync with 'backend/auth/api/types.go' AuthenticationMode options and
 * 'backendapi.js' file.
 *
 * @const {!backendApi.SupportedAuthenticationModes}
 */
const Modes = {
  /** @export {!backendApi.AuthenticationMode} */
  TOKEN: 'token',
  /** @export {!backendApi.AuthenticationMode} */
  BASIC: 'basic',
};

/** @final */
class LoginController {
  /**
   * @param {!./../chrome/nav/nav_service.NavService} kdNavService
   * @param {!./../common/auth/service.AuthService} kdAuthService
   * @param {!ui.router.$state} $state
   * @param {!angular.$q.Promise} kdAuthenticationModesResource
   * @param {!../common/errorhandling/service.ErrorService} kdErrorService
   * @ngInject
   */
  constructor(kdNavService, kdAuthService, $state, kdAuthenticationModesResource, kdErrorService) {
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
    /** @private {!Array<!backendApi.Error>} */
    this.errors = [];
    /** @private {!Array<!backendApi.AuthenticationMode>} */
    this.enabledAuthenticationModes_;
    /** @private {!angular.$q.Promise} */
    this.authenticationModesResource_ = kdAuthenticationModesResource;
    /** @export {!backendApi.SupportedAuthenticationModes} **/
    this.supportedAuthenticationModes = Modes;
    /** @private {!../common/errorhandling/service.ErrorService} */
    this.errorService_ = kdErrorService;
  }

  /** @export */
  $onInit() {
    // Check for errors that came during state transition
    if (this.state_.params.error) {
      this.errors.push(this.errorService_.toBackendApiError(this.state_.params.error));
    }

    this.loginSpec = new LoginSpec();
    /** Hide side menu while entering login page. */
    this.kdNavService_.setVisibility(false);
    /**
     * Init authentication modes
     * TODO(floreks): Investigate why state resolve does not work here
     */
    this.authenticationModesResource_.then((authModes) => {
      this.enabledAuthenticationModes_ = authModes.modes;
    });
  }

  /**
   * @param {!backendApi.AuthenticationMode} mode
   * @export
   */
  isAuthenticationModeEnabled(mode) {
    let enabled = false;
    if (this.enabledAuthenticationModes_) {
      this.enabledAuthenticationModes_.forEach((enabledMode) => {
        if (mode === enabledMode) {
          enabled = true;
        }
      });
    }

    return enabled;
  }

  /**
   * @param {!backendApi.LoginSpec} loginSpec
   * @export
   */
  onUpdate(loginSpec) {
    this.loginSpec.username = this.getValue_(this.loginSpec.username, loginSpec.username);
    this.loginSpec.password = this.getValue_(this.loginSpec.password, loginSpec.password);
    this.loginSpec.token = this.getValue_(this.loginSpec.token, loginSpec.token);
    this.loginSpec.kubeConfig = this.getValue_(this.loginSpec.kubeConfig, loginSpec.kubeConfig);
  }

  /**
   * On option change resets login spec to default state.
   *
   * @export
   */
  onOptionChange() {
    this.loginSpec = new LoginSpec();
  }

  /**
   * @param {string} oldVal
   * @param {string} newVal
   * @return {string}
   * @private
   */
  getValue_(oldVal, newVal) {
    return oldVal !== newVal && newVal.length > 0 ? newVal : oldVal;
  }

  /** @export */
  login() {
    if (this.form.$valid) {
      this.kdAuthService_.login(this.loginSpec)
          .then((errors) => {
            if (errors.length > 0) {
              this.errors = errors;
              return;
            }

            this.kdNavService_.setVisibility(true);
            this.state_.transitionTo(overviewState);
          })
          .catch((err) => {
            this.errors = [this.errorService_.toBackendApiError(err)];
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
