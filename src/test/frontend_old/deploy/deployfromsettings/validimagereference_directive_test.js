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

import deployModule from 'deploy/module';

describe('Valid ImageReference directive', () => {
  /** @type {function(!angular.Scope):!angular.JQLite} */
  let compileFn;
  /** @type {!angular.Scope} */
  let scope;
  /** @type {!angular.$httpBackend} */
  let httpBackend;

  beforeEach(() => {
    angular.mock.module(deployModule.name);

    angular.mock.inject(($compile, $rootScope, $httpBackend) => {
      compileFn = $compile(
          '<div kd-valid-imagereference ng-model="containerImage" invalid-image-error-message="errorMessage"></div>');
      scope = $rootScope.$new();
      httpBackend = $httpBackend;
    });
  });

  it('should validate image reference', () => {
    scope.containerImage = 'Test';
    let endpoint = httpBackend.when('POST', 'api/v1/appdeployment/validate/imagereference');

    let elem = compileFn(scope)[0];
    expect(elem.classList).toContain('ng-valid');
    expect(elem.classList).not.toContain('ng-pending');

    endpoint.respond({
      valid: false,
      reason: 'invalid reference format',
    });
    scope.$apply();
    expect(elem.classList).not.toContain('ng-valid');
    expect(elem.classList).toContain('ng-pending');

    httpBackend.flush();
    expect(elem.classList).toContain('ng-invalid');
    expect('invalid reference format').toEqual(scope.errorMessage);
    expect(elem.classList).not.toContain('ng-valid');
    expect(elem.classList).not.toContain('ng-pending');

    scope.containerImage = 'private.registry:5000/test:1';
    endpoint.respond({
      valid: true,
      reason: '',
    });
    scope.$apply();
    httpBackend.flush();
    expect(elem.classList).toContain('ng-valid');
  });

  it('should treat failures', () => {
    scope.containerImage = 'test';

    let elem = compileFn(scope)[0];
    httpBackend.when('POST', 'api/v1/appdeployment/validate/imagereference')
        .respond(503, 'Service Unavailable');
    httpBackend.flush();
    expect(elem.classList).not.toContain('ng-pending');
    expect(elem.classList).toContain('ng-invalid');
    expect('Service Unavailable').toEqual(scope.errorMessage);
  });
});
