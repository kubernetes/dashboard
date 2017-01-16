// Copyright 2015 Google Inc. All Rights Reserved.
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

import CreateSecretController from 'deploy/createsecret_controller';
import deployModule from 'deploy/deploy_module';

describe('Create-Secret dialog', () => {
  /** @type {!CreateSecretControllerController} */
  let ctrl;
  /** @type {!angular.$httpBackend} */
  let httpBackend;

  beforeEach(() => {
    angular.mock.module(deployModule.name);
    angular.mock.inject(($controller, $httpBackend) => {
      ctrl = $controller(CreateSecretController, {
        'namespace': 'default',
      });
      httpBackend = $httpBackend;
      httpBackend.expectGET('api/v1/csrftoken/secret').respond(200, '{"token": "x"}');
    });
  });

  /**
   * Test the secret name validation pattern.
   */
  it('should validate proper secret names as correct', () => {
    // given the k8s rule for secret names
    let rule = ctrl.secretNamePattern;

    // then the following secret names should be accepted
    expect('mysecret'.match(rule)).toBeDefined();
    expect('my.secret.com'.match(rule)).toBeDefined();
    expect('my-secret32.com'.match(rule)).toBeDefined();
  });

  it('should validate inproper secret names as incorrect', () => {
    // given the k8s rule for secret names
    let rule = ctrl.secretNamePattern;

    // then the following secret names should be rejected
    expect('illegalsecret§$'.match(rule)).toBeNull();
    expect('.dotpreffix.com'.match(rule)).toBeNull();
    expect('dotsuffix.com.'.match(rule)).toBeNull();
    expect('-dashprefix.com'.match(rule)).toBeNull();
    expect('dashsuffix-'.match(rule)).toBeNull();
    expect('umlautsÖÄ.not.allowed'.match(rule)).toBeNull();
    expect('name with spaces'.match(rule)).toBeNull();
    expect('  '.match(rule)).toBeNull();
  });

  /**
   * Test the Base64 validation pattern for the .dockercfg data.
   */
  it('should validate Base64 data as correct', () => {
    // given a Base64 matching regex
    let rule = ctrl.dataPattern;

    // then the following data should be accepted
    expect((`eyAiaHR0cHM6Ly9pbmRleC5kb2NrZXIuaW8vdjEvIjogeyAiYXV0aCI6ICJabUZyWlhCaG` +
            `MzTjNiM0prTVRJSyIsICJlbWFpbCI6ICJqZG9lQGV4YW1wbGUuY29tIiB9IH0K`)
               .match(rule))
        .toBeDefined();
  });

  it('should validate non-Base64 data as incorrect', () => {
    // given a Base64 matching regex
    let rule = ctrl.dataPattern;

    // then the following data strings should be rejected
    expect('aaa'.match(rule)).toBeNull();
    expect('=asd8'.match(rule)).toBeNull();
    expect('==aaa'.match(rule)).toBeNull();
    expect('abcde'.match(rule)).toBeNull();
  });

  it('should not submit if the form has validation errors', () => {
    // given a validation error in the html form
    ctrl.secretForm = {};
    ctrl.secretForm.$valid = false;
    // when trying to submit
    ctrl.createSecret();

    httpBackend.flush(1);  // flush the get for the token.
    // then form data was not sent to backend (thus flush will throw error)
    expect(httpBackend.flush).toThrow();
  });

  it('should submit if the form has no valiadtion errors', () => {
    // given no validation error in the html form
    ctrl.secretForm = {};
    ctrl.secretForm.$valid = true;
    ctrl.secretName = 'mysecret';
    ctrl.data = `eyAiaHR0cHM6Ly9pbmRleC5kb2NrZXIuaW8vdjEvIjogeyAiYXV0aCI6ICJabUZyWlhCaG` +
        `MzTjNiM0prTVRJSyIsICJlbWFpbCI6ICJqZG9lQGV4YW1wbGUuY29tIiB9IH0K`;
    httpBackend
        .expect(
            'POST', 'api/v1/secret',
            {name: ctrl.secretName, namespace: ctrl.namespace, data: ctrl.data})
        .respond(201, 'success');
    // when trying to submit
    ctrl.createSecret();
    // then data is sent successfully
    httpBackend.flush();
  });

  it('should hide creation dialog and open an error dialog if secret cannot be created', () => {
    spyOn(ctrl.errorDialog_, 'open');
    spyOn(ctrl.mdDialog_, 'hide');
    spyOn(ctrl.log_, 'info');
    ctrl.secretForm = {};
    ctrl.secretForm.$valid = true;
    /** @type {string} */
    let errorMessage = 'Something bad happened';
    // return an erroneous response
    httpBackend.expectPOST('api/v1/secret').respond(500, errorMessage);
    // when
    ctrl.createSecret();
    httpBackend.flush();
    // expect
    expect(ctrl.mdDialog_.hide).toHaveBeenCalled();
    expect(ctrl.errorDialog_.open).toHaveBeenCalledWith('Error creating secret', errorMessage);
    expect(ctrl.log_.info).toHaveBeenCalled();

  });

  it('cancel dialog', () => {
    spyOn(ctrl.mdDialog_, 'cancel');
    // when
    ctrl.cancel();
    // then
    expect(ctrl.mdDialog_.cancel).toHaveBeenCalled();
  });
});
