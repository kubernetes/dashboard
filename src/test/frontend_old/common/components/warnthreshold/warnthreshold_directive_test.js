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

import componentsModule from 'common/components/module';

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
          '<input type="number" ng-model="maxInput" name="inputField" kd-warn-threshold="100"' +
          'kd-warn-threshold-bind="showWarning">' +
          '<span class="kd-warn-threshold" ng-show="showWarning">Error</span>' +
          '</md-input-container>' +
          '</form>');
    });
  });

  it('should show warning when threshold is breached', () => {
    // given
    let element = compileFn(scope);
    let inputContainer = element.find('md-input-container')[0];
    let errMessageElement = element.find('span')[0];
    let inputValue = 101;

    // when
    scope.inputForm.inputField.$setViewValue(inputValue);
    scope.$digest();

    // then
    expect(inputContainer.classList).toContain('kd-warning');
    expect(errMessageElement.classList).not.toContain('ng-hide');
  });

  it('should remove warning when value has been changed to lower than threshold', () => {
    let element = compileFn(scope);
    let inputContainer = element.find('md-input-container')[0];
    let errMessageElement = element.find('span')[0];

    scope.inputForm.inputField.$setViewValue(105);
    scope.$digest();

    expect(inputContainer.classList).toContain('kd-warning');
    expect(errMessageElement.classList).not.toContain('ng-hide');

    scope.inputForm.inputField.$setViewValue(100);
    scope.$digest();

    expect(inputContainer.classList).not.toContain('kd-warning');
    expect(errMessageElement.classList).toContain('ng-hide');
  });
});
