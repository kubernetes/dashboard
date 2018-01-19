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

import resourceCardModule from 'common/components/resourcecard/resourcecard_module';

describe('Resource card columns', () => {
  /** @type {!ResourceCardColumnsController} */
  let ctrl;

  beforeEach(() => {
    angular.mock.module(resourceCardModule.name);

    angular.mock.inject(($componentController, $rootScope) => {
      let listCtrl = {sizeBodyColumn: () => {}};
      ctrl = $componentController(
          'kdResourceCardColumns', {$scope: $rootScope}, {resourceCardListCtrl: listCtrl});
    });
  });

  it('should not allow for adding columns before initialization', () => {
    expect(() => {
      ctrl.addAndSizeColumn({});
    })
        .toThrow(
            new Error('Resource card columns component must be initialized before adding columns'));

    ctrl.$onInit();
    expect(() => {
      ctrl.addAndSizeColumn({});
    }).not.toThrow();
  });
});
