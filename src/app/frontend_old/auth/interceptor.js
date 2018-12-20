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

/** @final */
export class AuthInterceptor {
  /**
   * @param {!angular.$cookies} $cookies
   * @param {string} kdTokenCookieName
   * @param {string} kdTokenHeaderName
   * @ngInject
   */
  constructor($cookies, kdTokenCookieName, kdTokenHeaderName) {
    this.request = (config) => {
      // Filter requests made to our backend starting with 'api/v1' and append request header
      // with token stored in a cookie.
      if (config.url.indexOf('api/v1') !== -1) {
        config.headers[kdTokenHeaderName] = $cookies.get(kdTokenCookieName);
      }

      return config;
    };
  }

  /**
   * @param {!angular.$cookies} $cookies
   * @param {string} kdTokenCookieName
   * @param {string} kdTokenHeaderName
   * @return {./interceptor.AuthInterceptor}
   * @ngInject
   */
  static NewAuthInterceptor($cookies, kdTokenCookieName, kdTokenHeaderName) {
    return new AuthInterceptor($cookies, kdTokenCookieName, kdTokenHeaderName);
  }
}
