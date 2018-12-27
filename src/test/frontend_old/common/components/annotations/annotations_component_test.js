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

import module from 'common/components/module';

describe('annotations component', () => {
  /** @type {!angular.Scope} */
  let scope;
  /** @type {function(!angular.Scope):!angular.JQLite} */
  let compileFn;

  beforeEach(() => {
    angular.mock.module(module.name);

    angular.mock.inject(($rootScope, $compile) => {
      scope = $rootScope.$new();
      compileFn = $compile('<kd-annotations labels="annotations"></kd-annotations>');
    });
  });

  it('should render 3 annotations of unknown kind as labels', () => {
    // given
    scope.annotations = {
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
    angular.forEach(scope.annotations, (value) => {
      expect(labels.eq(index).text().trim()).toBe(`${value}`);
      index++;
    });
  });

  it('should render 1 annotation of created-by kind as serialized reference', () => {
    // given
    scope.annotations = {
      app: 'app',
      'kubernetes.io/created-by': '{bogus: "json"}',
      testLabel: 'test',
    };

    // when
    let element = compileFn(scope);
    scope.$digest();

    // then
    let labels = element.find('kd-middle-ellipsis');
    expect(labels.length).toEqual(2);

    let index = 0;
    angular.forEach(scope.annotations, (value, key) => {
      if (key !== 'kubernetes.io/created-by') {
        expect(labels.eq(index).text().trim()).toBe(`${value}`);
        index++;
      }
    });
    let annotations = element.find('kd-serialized-reference');
    expect(annotations.length).toEqual(1);
    expect(annotations.eq(0).text().trim()).toBe('{bogus: "json"}');
  });

  it('should render last applied config in a special way', () => {
    // given
    scope.annotations = {
      app: 'app',
      'kubectl.kubernetes.io/last-applied-configuration': '{bogus: "json"}',
      testLabel: 'test',
    };

    // when
    let element = compileFn(scope);
    scope.$digest();

    // then
    let labels = element.find('kd-last-applied-configuration');
    expect(labels.length).toEqual(1);
  });
});
