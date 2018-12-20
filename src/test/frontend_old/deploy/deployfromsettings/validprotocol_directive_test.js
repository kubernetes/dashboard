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

describe('Valid protocol directive', () => {
  /** @type {function(!angular.Scope):!angular.JQLite} */
  let compileFn;
  /** @type {!angular.Scope} */
  let scope;
  /** @type {!angular.$httpBackend} */
  let httpBackend;

  beforeEach(() => {
    angular.mock.module(deployModule.name);

    angular.mock.inject(($compile, $rootScope, $httpBackend) => {
      compileFn =
          $compile('<div kd-valid-protocol ng-model="protocol" is-external="isExternal"></div>');
      scope = $rootScope.$new();
      httpBackend = $httpBackend;
    });
  });

  it('should validate protocol asynchronosuly', () => {
    let endpoint = httpBackend.whenPOST('api/v1/appdeployment/validate/protocol');

    let elem = compileFn(scope)[0];
    expect(elem.classList).toContain('ng-valid');
    expect(elem.classList).not.toContain('ng-pending');

    scope.$apply();
    expect(elem.classList).not.toContain('ng-invalid');

    scope.protocol = 'TCP';
    scope.isExternal = false;
    endpoint.respond({
      valid: true,
    });

    httpBackend.flush();
    expect(elem.classList).toContain('ng-valid');
    expect(elem.classList).not.toContain('ng-invalid');
    expect(elem.classList).not.toContain('ng-pending');

    scope.protocol = 'UDP';
    endpoint.respond({
      valid: false,
    });
    scope.$apply();

    httpBackend.flush();
    expect(elem.classList).toContain('ng-invalid');
  });

  it('should validate on service type change', () => {
    let elem = compileFn(scope)[0];
    httpBackend.whenPOST('api/v1/appdeployment/validate/protocol').respond({
      valid: false,
    });
    scope.$apply();

    scope.isExternal = false;
    httpBackend.flush();
    expect(elem.classList).not.toContain('ng-pending');

    scope.isExternal = true;
    scope.$apply();
    expect(elem.classList).toContain('ng-pending');
  });

  it('should treat failures as invalid protocol', () => {
    let elem = compileFn(scope)[0];
    httpBackend.whenPOST('api/v1/appdeployment/validate/protocol').respond(503, '');
    scope.$apply();

    scope.isExternal = false;
    httpBackend.flush();
    expect(elem.classList).not.toContain('ng-pending');
    expect(elem.classList).toContain('ng-invalid');
  });
});
