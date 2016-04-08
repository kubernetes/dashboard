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

import resourceCardModule from 'common/components/resourcecard/resourcecard_module';

describe('Resource card', () => {
  /** @type {!angular.Scope} */
  let scope;
  /** @type {!angular.$compile} */
  let compile;

  beforeEach(() => {
    angular.mock.module(resourceCardModule.name);

    angular.mock.inject(($rootScope, $compile) => {
      scope = $rootScope.$new();
      compile = $compile;
    });
  });

  it('should fill the card layout', () => {
    let compileFn = compile(`<kd-resource-card>
        <kd-resource-card-status>STATUS</kd-resource-card-status>
          <kd-resource-card-columns>
            <kd-resource-card-column>
              FIRST COLUMN
            </kd-resource-card-column>
            <kd-resource-card-column>
              SECOND COLUMN
            </kd-resource-card-column>
            <kd-resource-card-column>
              THIRD COLUMN
            </kd-resource-card-column>
          </kd-resource-card-columns>
        <kd-resource-card-footer>FOOTER</kd-resource-card-footer>
      </kd-resource-card>`);

    let elem = compileFn(scope);
    scope.$digest();

    expect(elem.html()).toContain('FIRST COLUMN');
    expect(elem.html()).toContain('SECOND COLUMN');
    expect(elem.html()).toContain('THIRD COLUMN');
    expect(elem.html()).toContain('STATUS');
    expect(elem.html()).toContain('FOOTER');
  });
});

describe('Resource card controller', () => {
  /** @type {!common/components/resourcecard/resourcecard_component.ResourceCardController} */
  let ctrl;
  /** @type {!angular.$transclude} */
  let transclude;

  beforeEach(() => {
    angular.mock.module(resourceCardModule.name);

    angular.mock.inject(($componentController, $rootScope) => {
      transclude = {};
      ctrl = $componentController('kdResourceCard', {$transclude: transclude, $scope: $rootScope});
    });
  });

  it('ignore footer when not defined', () => {
    transclude.isSlotFilled = () => true;
    expect(ctrl.hasFooter()).toBe(true);

    transclude.isSlotFilled = () => false;
    expect(ctrl.hasFooter()).toBe(false);
  });
});
