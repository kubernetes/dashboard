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
import settingsServiceModule from 'common/settings/module';

describe('Resource card header columns', () => {
  /** @type {!ResourceCardHeaderColumnsController} */
  let ctrl;
  /** @type {!Object} */
  let cardListCtrl;

  beforeEach(() => {
    angular.mock.module(resourceCardModule.name);
    angular.mock.module(settingsServiceModule.name);

    angular.mock.inject(($componentController) => {
      cardListCtrl = {
        setHeaderColumns: () => {},
      };
      ctrl = $componentController('kdResourceCardHeaderColumns', {}, {
        resourceCardListCtrl: cardListCtrl,
      });
    });
  });

  it('should init controller', () => {
    expect(ctrl).toBeDefined();
  });

  it('should set headers column on init', () => {
    // given
    spyOn(cardListCtrl, 'setHeaderColumns');

    // when
    ctrl.$onInit();

    // then
    expect(cardListCtrl.setHeaderColumns).toHaveBeenCalled();
  });

  it('should reset sorting on all sortable columns', () => {
    // given
    let mockSortableColumnCtrl = {isSortable: () => {}, reset: () => {}};
    let mockColumnCtrl = {isSortable: () => {}, reset: () => {}};

    spyOn(mockSortableColumnCtrl, 'isSortable').and.returnValue(true);
    spyOn(mockSortableColumnCtrl, 'reset');
    spyOn(mockColumnCtrl, 'isSortable').and.returnValue(false);
    spyOn(mockColumnCtrl, 'reset');

    ctrl.columns_ = [mockSortableColumnCtrl, mockColumnCtrl];

    // when
    ctrl.reset();

    // then
    expect(ctrl.columns_[0].isSortable).toHaveBeenCalled();
    expect(ctrl.columns_[0].reset).toHaveBeenCalled();

    expect(ctrl.columns_[1].isSortable).toHaveBeenCalled();
    expect(ctrl.columns_[1].reset).not.toHaveBeenCalled();
  });
});
