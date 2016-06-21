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
  /** @type {!angular.$window} */
  let window;

  beforeEach(() => {
    angular.mock.module(componentsModule.name);

    angular.mock.inject(($rootScope, $compile, $window) => {
      scope = $rootScope.$new();
      window = $window;
      compileFn = $compile(`<div><kd-middle-ellipsis display-string="{{displayString}}"
          max-length="{{maxLength}}"></kd-middle-ellipsis></div>`);
    });
  });

  it('should show original display string', () => {
    // given
    let stringLength = 16;
    scope.displayString = new Array(stringLength + 1).join('x');
    let element = compileFn(scope);
    document.body.appendChild(element[0]);

    // when
    element[0].style.width = '500px';
    window.dispatchEvent(new Event('resize'));
    scope.$digest();

    // then
    expect(element.text().trim().length).toEqual(stringLength);

    // when
    element[0].style.width = '1px';
    window.dispatchEvent(new Event('resize'));
    scope.$digest();

    // then
    expect(element.text().trim().length).toEqual(0);

    // when
    element[0].style.width = '50px';
    window.dispatchEvent(new Event('resize'));
    scope.$digest();

    // then
    expect(element.text().trim().length).toEqual(7);
  });
});
