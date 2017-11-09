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
import resourceCardModule from 'common/components/resourcecard/resourcecard_module';
import errorModule from 'common/errorhandling/module';
import settingsServiceModule from 'common/settings/module';

describe('Resource card list', () => {
  /** @type {!angular.Scope} */
  let scope;
  /** @type {!angular.$compile} */
  let compile;

  beforeEach(() => {
    angular.mock.module(resourceCardModule.name);
    angular.mock.module(componentsModule.name);
    angular.mock.module(errorModule.name);
    angular.mock.module(settingsServiceModule.name);

    angular.mock.inject(($rootScope, $compile) => {
      scope = $rootScope.$new();
      compile = $compile;
    });
  });

  it('should fill the card layout', () => {
    let compileFn = compile(`
      <kd-resource-card-list selectable="selectable" with-statuses="withStatuses">
        <kd-resource-card-list-header>Foo</kd-resource-card-list-header>
        <kd-resource-card-header-columns>
          <kd-resource-card-header-column size="small" grow="nogrow">
            NAME_COLUMN
          </kd-resource-card-header-column>
          <kd-resource-card-header-column size="large" grow="2">
            AGE_COLUMN
          </kd-resource-card-header-column>
          <kd-resource-card-header-column>
            LABELS_COLUMN
          </kd-resource-card-header-column>
        </kd-resource-card-header-columns>
        <kd-resource-card object-meta="{}" type-meta="{}">
          <kd-resource-card-status>STATUS</kd-resource-card-status>
            <kd-resource-card-columns>
              <kd-resource-card-column>
                FIRST_COLUMN1
              </kd-resource-card-column>
              <kd-resource-card-column>
                SECOND_COLUMN1
              </kd-resource-card-column>
              <kd-resource-card-column>
                THIRD_COLUMN1
              </kd-resource-card-column>
            </kd-resource-card-columns>
          <kd-resource-card-footer>FOOTER</kd-resource-card-footer>
        </kd-resource-card>
        <kd-resource-card  object-meta="{}" type-meta="{}">
          <kd-resource-card-status>STATUS</kd-resource-card-status>
            <kd-resource-card-columns>
              <kd-resource-card-column>
                FIRST_COLUMN2
              </kd-resource-card-column>
              <kd-resource-card-column>
                SECOND_COLUMN2
              </kd-resource-card-column>
              <kd-resource-card-column>
                THIRD_COLUMN2
              </kd-resource-card-column>
            </kd-resource-card-columns>
          <kd-resource-card-footer>FOOTER</kd-resource-card-footer>
        </kd-resource-card>
      </kd-resource-card-list>
      `);

    let elem = compileFn(scope);
    scope.$digest();

    expect(elem.html()).toContain('NAME_COLUMN');
    expect(elem.html()).toContain('AGE_COLUMN');
    expect(elem.html()).toContain('LABELS_COLUMN');
    expect(elem.html()).toContain('FIRST_COLUMN1');
    expect(elem.html()).toContain('SECOND_COLUMN1');
    expect(elem.html()).toContain('THIRD_COLUMN1');
    expect(elem.html()).toContain('FIRST_COLUMN2');
    expect(elem.html()).toContain('SECOND_COLUMN2');
    expect(elem.html()).toContain('THIRD_COLUMN2');
    expect(elem.html()).not.toContain('STATUS');
    expect(elem.html()).toContain('FOOTER');
    expect(elem.html()).not.toContain('md-checkbox');
    expect(elem.html()).toContain('kd-resource-card-list-header');

    scope.withStatuses = true;
    scope.$digest();
    expect(elem.html()).toContain('STATUS');
    expect(elem.html()).not.toContain('md-checkbox');

    scope.selectable = true;
    scope.$digest();
    expect(elem.html()).toContain('md-checkbox');
  });

  it('should throw an error when no object meta', () => {
    let compileFn = compile(`
      <kd-resource-card-list selectable="selectable" with-statuses="withStatuses">
        <kd-resource-card-header-columns>
          <kd-resource-card-header-column size="small" grow="nogrow">
            NAME_COLUMN
          </kd-resource-card-header-column>
        </kd-resource-card-header-columns>
        <kd-resource-card type-meta="{}">
            <kd-resource-card-columns>
              <kd-resource-card-column>
                FIRST_COLUMN1
              </kd-resource-card-column>
            </kd-resource-card-columns>
        </kd-resource-card>
      </kd-resource-card-list>
      `);

    compileFn(scope);
    expect(scope.$digest)
        .toThrow(new Error('object-meta binding is required for resource card component'));
  });

  it('should throw an error when no type meta', () => {
    let compileFn = compile(`
    <kd-resource-card-list selectable="selectable" with-statuses="withStatuses">
      <kd-resource-card-header-columns>
        <kd-resource-card-header-column size="small" grow="nogrow">
          NAME_COLUMN
        </kd-resource-card-header-column>
      </kd-resource-card-header-columns>
      <kd-resource-card object-meta="{}">
          <kd-resource-card-columns>
            <kd-resource-card-column>
              FIRST_COLUMN1
            </kd-resource-card-column>
          </kd-resource-card-columns>
      </kd-resource-card>
    </kd-resource-card-list>
    `);

    compileFn(scope);
    expect(scope.$digest)
        .toThrow(new Error('type-meta binding is required for resource card component'));
  });
});
