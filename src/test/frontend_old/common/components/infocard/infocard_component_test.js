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

import module from 'common/components/infocard/infocard_module';

describe('Info card', () => {
  /** @type {!angular.Scope} */
  let scope;
  /** @type {!angular.$compile} */
  let compile;

  beforeEach(() => {
    angular.mock.module(module.name);

    angular.mock.inject(($rootScope, $compile) => {
      scope = $rootScope.$new();
      compile = $compile;
    });
  });

  it('should fill the layout', () => {
    let compileFn = compile(`
      <kd-info-card>
        <kd-info-card-header>FOO</kd-info-card-header>
        <kd-info-card-section name="Details">
          <kd-info-card-entry title="Name">BAR</kd-info-card-entry>
          <kd-info-card-entry title="Namespace">MyNamespace</kd-info-card-entry>
        </kd-info-card-section>
      </kd-info-card>`);

    let elem = compileFn(scope);
    scope.$digest();

    expect(elem.html()).toContain('FOO');
    expect(elem.html()).toContain('BAR');
  });
});
