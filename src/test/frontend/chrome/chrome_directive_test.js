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

import chromeModule from 'chrome/chrome_module';

describe('Chrome directive', () => {
  /** @type {!angular.Scope} */
  let scope;
  /** @type {function(!angular.Scope):!angular.JQLite} */
  let compileFn;

  beforeEach(() => {
    angular.mock.module(chromeModule.name);
    angular.mock.inject(($compile, $rootScope, $httpBackend) => {
      scope = $rootScope.$new();
      compileFn = $compile('<chrome></chrome>');
      $httpBackend.when('GET', 'assets/images/kubernetes-logo.svg').respond(404);
    });
  });

  it('should register current scope on controller', () => {
    // given
    let elem = compileFn(scope);

    // when
    scope.$apply();

    // then
    expect(elem.find('.kd-center-fixed')[0]).not.toBeUndefined();

    // given
    scope.$broadcast('$stateChangeSuccess');

    // when
    scope.$apply();

    // then
    expect(elem.find('.kd-center-fixed')[0]).toBeUndefined();
  });
});
