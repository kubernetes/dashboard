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

import contentCardModule from 'common/components/contentcard/contentcard_module';

describe('Content card', () => {
  /** @type {!angular.Scope} */
  let scope;
  /** @type {!angular.$compile} */
  let compile;

  beforeEach(() => {
    angular.mock.module(contentCardModule.name);

    angular.mock.inject(($rootScope, $compile) => {
      scope = $rootScope.$new();
      compile = $compile;
    });
  });

  it('should fill the layout', () => {
    let compileFn = compile(`
      <kd-content-card>
        <kd-title>MY_TITLE</kd-title>
        <kd-content>MY_CONTENT</kd-content>
      </kd-content-card>
      `);

    let elem = compileFn(scope);
    scope.$digest();

    expect(elem.html()).toContain('MY_TITLE');
    expect(elem.html()).toContain('MY_CONTENT');
  });
});
