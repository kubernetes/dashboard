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

import componentsModule from 'common/components/components_module';

describe('Middle ellipsis directive', () => {
  /** @type {!angular.Scope} */
  let scope;
  /** @type {function(!angular.Scope):!angular.JQLite} */
  let compileFn;

  beforeEach(() => {
    angular.mock.module(componentsModule.name);

    angular.mock.inject(($rootScope, $compile) => {
      scope = $rootScope.$new();
      compileFn = $compile(
          '<kd-middle-ellipsis display-string="{{displayString}}" max-length="{{maxLength}}">' +
          '</kd-middle-ellipsis>');
    });
  });

  it('should show truncated string', () => {
    // given
    scope.displayString = 'x'.repeat(32);
    scope.maxLength = 16;
    // + 3 is for the '...' between truncated string
    let expectedLength = scope.maxLength + 3;

    // when
    let element = compileFn(scope);
    scope.$digest();

    // then
    let actual = element.text().trim();
    expect(actual.length).toEqual(expectedLength);
  });

  it('should show original display string', () => {
    // given
    let stringLength = 16;
    scope.displayString = 'x'.repeat(stringLength);
    scope.maxLength = 32;

    // when
    let element = compileFn(scope);
    scope.$digest();

    // then
    let actual = element.text().trim();
    expect(actual.length).toEqual(stringLength);
  });
});
