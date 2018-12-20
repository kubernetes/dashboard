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

describe('SerializedReference directive', () => {
  /** @type {!angular.Scope} */
  let scope;
  /** @type {function(!angular.Scope):!angular.JQLite} */
  let compileFn;

  beforeEach(() => {
    angular.mock.module(componentsModule.name);

    angular.mock.inject(($rootScope, $compile) => {
      scope = $rootScope.$new();
      compileFn =
          $compile('<kd-serialized-reference reference="reference"></kd-serialized-reference>');
    });
  });

  it('should render a link if a valid reference is given', () => {
    // given
    scope.reference = JSON.stringify({
      kind: 'SerializedReference',
      reference: {kind: 'Job', name: 'testJob', namespace: 'testing'},
    });

    // when
    let element = compileFn(scope);
    scope.$digest();

    // then
    let link = element.find('a');
    expect(link.length).toEqual(1);
  });

  it('should not render a link if an invalid reference is given', () => {
    // given
    scope.reference = '{invalid json';

    // when
    let element = compileFn(scope);
    scope.$digest();

    // then
    let link = element.find('a');
    expect(link.length).toEqual(0);
  });
});
