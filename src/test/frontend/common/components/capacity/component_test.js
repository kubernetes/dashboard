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

describe('capacity component', () => {
  /** @type {!CapacityController} */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(module.name);

    angular.mock.inject(($componentController) => {
      ctrl = $componentController('kdCapacity');
    });
  });

  it('should initialize controller', () => {
    expect(ctrl).not.toBeNull();
  });

  it('should capitalize resource name', () => {
    // given
    let cases = [
      {resourceName: '', expected: ''},
      {resourceName: 't', expected: 'T'},
      {resourceName: 'T', expected: 'T'},
      {resourceName: 'te', expected: 'Te'},
      {resourceName: 'Te', expected: 'Te'},
      {resourceName: 'test', expected: 'Test'},
      {resourceName: 'Test', expected: 'Test'},
    ];

    // when
    cases.forEach((c) => {
      let result = ctrl.capitalize(c.resourceName);

      // then
      expect(result).toEqual(c.expected);
    });
  });
});
