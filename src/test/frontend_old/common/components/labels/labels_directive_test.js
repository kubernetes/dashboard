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

describe('Labels directive', () => {
  /** @type {!angular.Scope} */
  let scope;
  /** @type {function(!angular.Scope):!angular.JQLite} */
  let compileFn;

  beforeEach(() => {
    angular.mock.module(componentsModule.name);

    angular.mock.inject(($rootScope, $compile) => {
      scope = $rootScope.$new();
      compileFn = $compile('<kd-labels labels="labels"></kd-labels>');
    });
  });

  it('should render 3 labels', () => {
    // given
    scope.labels = {
      app: 'app',
      version: 'version',
      testLabel: 'test',
    };

    // when
    let element = compileFn(scope);
    scope.$digest();

    // then
    let labels = element.find('kd-middle-ellipsis');
    expect(labels.length).toEqual(3);
    let index = 0;
    angular.forEach(scope.labels, (value, key) => {
      expect(labels.eq(index).text().trim()).toBe(`${key}: ${value}`);
      index++;
    });
  });
});
