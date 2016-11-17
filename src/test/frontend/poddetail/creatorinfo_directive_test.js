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

import module from 'poddetail/poddetail_module';

describe('CreatorInfo directive', () => {
  /** @type {!angular.Scope} */
  let scope;
  /** @type {function(!angular.Scope):!angular.JQLite} */
  let compileFn;

  beforeEach(() => {
    angular.mock.module(module.name);

    angular.mock.inject(($rootScope, $compile) => {
      scope = $rootScope.$new();
      compileFn = $compile('<kd-creator-info creator="creator"></kd-creator-info>');
    });
  });

  it('Should just display the kind of unknown creator kinds', () => {
    // given
    scope.creator = {kind: 'Unknown'};

    // when
    let element = compileFn(scope);
    scope.$digest();

    // then
    let span = element.find('span');
    expect(span.text().trim()).toContain('Unknown');
  });

  const kind2directive = new Map([
    ['Job', 'job'],
    ['DaemonSet', 'daemon-set'],
    ['ReplicationController', 'replication-controller'],
    ['ReplicaSet', 'replica-set'],
    ['StatefulSet', 'stateful-set'],
  ]);

  kind2directive.forEach((directive, kind) => {
    it(`should render a ${kind} as a kd-${directive}-card-list`, () => {
      // given
      scope.creator = {kind: kind};

      // when
      let element = compileFn(scope);
      scope.$digest();

      // then
      let elem = element.find(`kd-${directive}-card-list`);
      expect(elem.length).toEqual(1);
    });
  });
});
