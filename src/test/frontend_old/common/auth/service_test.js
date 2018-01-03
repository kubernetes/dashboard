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

import authModule from 'common/auth/module';

describe('Auth service', () => {
  /** @type {!common/auth/service.AuthService} */
  let authService;
  /** @type {!angular.$httpBackend} */
  let httpBackend;
  /** @type {!angular.$cookies} */
  let cookies;
  /** @type {string} */
  let tokenCookieName;

  beforeEach(() => angular.mock.module(authModule.name));

  beforeEach(angular.mock.inject((kdAuthService, $httpBackend, $cookies, kdTokenCookieName) => {
    authService = kdAuthService;
    httpBackend = $httpBackend;
    cookies = $cookies;
    tokenCookieName = kdTokenCookieName;

    authService.skipLoginPage(false);
  }));

  // TODO(maciaszczykm): Enable after being able to mock HTTPS backend or use another workaround.
  xit(`should log in and return generated JWE token`, () => {
    // given
    let csrfToken = {token: 'csrf-test'};
    let generatedToken = {jweToken: 'jwe-test', errors: []};
    httpBackend.whenGET('api/v1/csrftoken/login').respond(csrfToken);
    httpBackend.whenPOST('api/v1/login').respond(generatedToken);

    // when
    authService.login({});
    httpBackend.flush();

    // then
    let token = cookies.get(tokenCookieName);
    expect(token).toEqual(generatedToken.jweToken);
  });

  it(`should throw an error during login attempt`, () => {
    let error = 'error';
    httpBackend.whenGET('api/v1/csrftoken/login').respond({});
    httpBackend.whenPOST('api/v1/login').respond(400, error);

    // when
    authService.login({}).catch((err) => {
      // then
      expect(err.data).toBe(error);
    });
    httpBackend.flush();
  });

  it(`should resolve with non critical error during login attempt`, () => {
    // given
    let error = {jweToken: '', errors: ['auth error']};
    httpBackend.whenGET('api/v1/csrftoken/login').respond({});
    httpBackend.whenPOST('api/v1/login').respond(200, error);

    // when
    authService.login({}).then((errors) => {
      // then
      expect(errors.length).toBe(1);
    });
    httpBackend.flush();
  });

  it('should return true when user is logged in', () => {
    // given
    let transition = {to: () => {}};
    spyOn(transition, 'to').and.returnValue({name: ''});

    httpBackend.whenGET('api/v1/login/status').respond(200, {tokenPresent: true});

    // when
    authService.isLoggedIn(transition).then((loggedIn) => {
      // then
      expect(loggedIn).toBe(true);
    });
    httpBackend.flush();
  });

  it('should skip login page', () => {
    // when
    authService.skipLoginPage(true);

    // then
    expect(cookies.get('skipLoginPage')).toBe('true');
  });

  it('should return false when login page is not enabled', () => {
    // when
    authService.skipLoginPage(true);

    // then
    expect(authService.isLoginPageEnabled()).toBe(false);
  });

  it('should allow entering overview page without logging in when using HTTP', () => {
    // given
    let transition = {to: () => {}};
    spyOn(transition, 'to').and.returnValue({name: 'overview'});

    httpBackend.whenGET('api/v1/csrftoken/login').respond(200);
    httpBackend.whenGET('api/v1/login/status').respond(200);

    // when
    authService.isLoggedIn(transition).then((result) => {
      // then
      expect(result).toBe(true);
    });
    httpBackend.flush();
  });

  it('should do nothing when token cookie not set', () => {
    // when
    authService.refreshToken().then((result) => {
      // then
      expect(result).toBe(true);
    });
  });

  it('should resolve with new token when token refreshed successfully', () => {
    // given
    cookies.put(tokenCookieName, 'oldToken');
    let expectedToken = 'newToken';
    httpBackend.whenGET('api/v1/csrftoken/token').respond(200);
    httpBackend.whenPOST('api/v1/token/refresh')
        .respond(200, {jweToken: expectedToken, errors: []});

    // when
    authService.refreshToken().then((result) => {
      // then
      expect(result).toEqual(expectedToken);
    });
    httpBackend.flush();
  });
});
