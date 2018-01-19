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

describe('Toggle hidden text', () => {
  /** @type {!angular.Scope} */
  let scope;
  /** @type {!angular.$compile} */
  let compile;

  beforeEach(() => {
    angular.mock.module(componentsModule.name);

    angular.mock.inject(($rootScope, $compile) => {
      scope = $rootScope.$new();
      compile = $compile;
    });
  });

  it('should fill the layout including placeholder', () => {
    let compileFn = compile(`
      <kd-toggle-hidden-text placeholder="FOO_PLACEHOLDER"
                             text="BAR_TEXT">
      </kd-toggle-hidden-text>
      `);

    let elem = compileFn(scope);
    scope.$digest();

    expect(elem.html()).toContain('FOO_PLACEHOLDER');
    expect(elem.html()).not.toContain('BAR_TEXT');
  });

  it('should fill the layout without placeholder', () => {
    let compileFn = compile(`
      <kd-toggle-hidden-text text="BAR_TEXT">
      </kd-toggle-hidden-text>
      `);

    let elem = compileFn(scope);
    scope.$digest();
    expect(elem.html()).toContain('BAR_TEXT');
  });
});
