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

import validatorsModule from 'common/validators/module';

describe('Validate directive', () => {
  /** @type {!angular.Scope} */
  let scope;
  /** @type {!angular.$compile} */
  let compile;

  beforeEach(() => {
    angular.mock.module(validatorsModule.name);

    angular.mock.inject(($rootScope, $compile) => {
      scope = $rootScope.$new();
      compile = $compile;
    });
  });

  it('should validate integer as valid', () => {
    // given
    scope.replicas = 5;
    let compileFn = compile('<input ng-model="replicas" type="number" kd-validate="integer">');

    // when
    let element = compileFn(scope)[0];
    scope.$digest();

    // then
    expect(element.classList).toContain('ng-valid');
  });

  it('should validate integer as invalid', () => {
    // given
    scope.replicas = 5.1;
    let compileFn = compile('<input ng-model="replicas" type="number" kd-validate="integer">');

    // when
    let element = compileFn(scope)[0];
    scope.$digest();

    // then
    expect(element.classList).toContain('ng-invalid');
  });

  it('should throw an error when wrong type is provided', () => {
    // given
    let typeName = 'invalid';
    let compileFn = compile(`<input ng-model='replicas' type='number' kd-validate='${typeName}'>`);

    // when and then
    expect(() => {
      compileFn(scope)[0];
      scope.$digest();
    }).toThrow(new TypeError(`Given validator '${typeName}' is not supported.`));
  });
});
