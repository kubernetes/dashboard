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

import csrftokenModule from '../csrftoken/module';

import {AuthorizerService} from './authorizer';
import {AuthInterceptor} from './interceptor';
import {AuthService} from './service';

/**
 * Angular module containing auth configuration.
 */
export default angular
    .module(
        'kubernetesDashboard.auth',
        [
          'ngCookies',
          'ngResource',
          'ui.router',
          csrftokenModule.name,
        ])
    .service('kdAuthService', AuthService)
    .service('kdAuthorizerService', AuthorizerService)
    .factory('kdAuthInterceptor', AuthInterceptor.NewAuthInterceptor)
    .config(initAuthInterceptor)
    .constant('kdTokenCookieName', 'jweToken')
    .constant('kdTokenHeaderName', 'jweToken')
    .run(initAuthService);

/**
 * Initializes the service to track state changes and make sure that user is logged in and
 * token has not expired.
 *
 * @param {./service.AuthService} kdAuthService
 * @ngInject
 */
function initAuthService(kdAuthService) {
  kdAuthService.init();
}

/**
 * @param {!angular.$HttpProvider} $httpProvider
 * @ngInject
 */
function initAuthInterceptor($httpProvider) {
  $httpProvider.interceptors.push('kdAuthInterceptor');
}
