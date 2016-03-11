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

describe('Warn threshold directive', () => {
  /** @type {!angular.Scope} */
  let scope;
  /** @type {function(!angular.Scope):!angular.JQLite} */
  let compileFn;

  beforeEach(() => {
    angular.mock.module(componentsModule.name);

    angular.mock.inject(($rootScope, $compile) => {
      scope = $rootScope.$new();
      compileFn = $compile(
          '<form name="inputForm">' +
          '<md-input-container>' +
          '<input type="number" ng-model="maxInput" name="inputField" kd-warn-threshold="100">' +
          '</md-input-container>' +
          '</form>');
    });
  });

  it('should show warning when threshold is breached', () => {
    // given
    let element = compileFn(scope);
    let inputValue = 101;

    // when
    scope.inputForm.inputField.$setViewValue(inputValue);
    scope.$digest();

    // then
    let inputContainer = element.find('md-input-container')[0];
    expect(inputContainer.classList).toContain('kd-warning');
  });

  it('should not show warning when threshold has not been breached', () => {
    // given
    let element = compileFn(scope);
    let inputValue = 100;

    // when
    scope.inputForm.inputField.$setViewValue(inputValue);
    scope.$digest();

    // then
    let inputContainer = element.find('md-input-container')[0];
    expect(inputContainer.classList).not.toContain('kd-warning');
  });
});
