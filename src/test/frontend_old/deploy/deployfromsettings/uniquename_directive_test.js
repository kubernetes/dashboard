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

describe('Unique name directive', () => {
  /** @type {function(!angular.Scope):!angular.JQLite} */
  let compileFn;
  /** @type {!angular.Scope} */
  let scope;
  /** @type {!angular.$httpBackend} */
  let httpBackend;

  beforeEach(() => {
    angular.mock.module(deployModule.name);

    angular.mock.inject(($compile, $rootScope, $httpBackend) => {
      compileFn = $compile('<div kd-unique-name ng-model="name" namespace="namespace"></div>');
      scope = $rootScope.$new();
      httpBackend = $httpBackend;
    });
  });

  it('should validate name asynchronosuly', () => {
    scope.name = 'foo-name';
    scope.namespace = 'foo-namespace';
    let endpoint = httpBackend.when('POST', 'api/v1/appdeployment/validate/name');

    let elem = compileFn(scope)[0];
    expect(elem.classList).toContain('ng-valid');
    expect(elem.classList).not.toContain('ng-pending');

    endpoint.respond({
      valid: false,
    });
    scope.$apply();
    expect(elem.classList).not.toContain('ng-valid');
    expect(elem.classList).toContain('ng-pending');

    httpBackend.flush();
    expect(elem.classList).toContain('ng-invalid');
    expect(elem.classList).not.toContain('ng-valid');
    expect(elem.classList).not.toContain('ng-pending');

    scope.name = 'foo-name2';
    endpoint.respond({
      valid: true,
    });
    scope.$apply();
    httpBackend.flush();
    expect(elem.classList).toContain('ng-valid');
  });

  it('should validate on namespace change', () => {
    scope.name = 'foo-name';
    scope.namespace = 'foo-namespace';

    let elem = compileFn(scope)[0];
    httpBackend.when('POST', 'api/v1/appdeployment/validate/name').respond({
      valid: false,
    });
    httpBackend.flush();
    expect(elem.classList).not.toContain('ng-pending');

    scope.namespace = 'foo-namespace2';
    scope.$apply();
    expect(elem.classList).toContain('ng-pending');
  });

  it('should treat failures as invalid name', () => {
    scope.name = 'foo-name';
    scope.namespace = 'foo-namespace';

    let elem = compileFn(scope)[0];
    httpBackend.when('POST', 'api/v1/appdeployment/validate/name').respond(503, '');
    httpBackend.flush();
    expect(elem.classList).not.toContain('ng-pending');
    expect(elem.classList).toContain('ng-valid');
  });
});
