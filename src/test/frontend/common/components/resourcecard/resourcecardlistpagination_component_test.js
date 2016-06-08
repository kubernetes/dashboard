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

describe('Resource card list pagination', () => {
  /** @type
   *  {!common/components/resourcecard/resourcecardlistpagination_component.ResourceCardListPaginationController}
   */
  let ctrl;
  /** @type
   *  {!common/components/resourcecard/resourcecardlistfooter_component.ResourceCardListFooterController}
   */
  let resourceCardListFooterCtrl;

  beforeEach(() => {
    angular.mock.module(resourceCardModule.name);

    angular.mock.inject(($componentController) => {
      resourceCardListFooterCtrl = {setListPagination: () => {}};
      ctrl = $componentController(
          'kdResourceCardListPagination', {},
          {resourceCardListFooterCtrl: resourceCardListFooterCtrl});
    });
  });

  it('should set pagination controller on resource card list footer ctrl', () => {
    spyOn(resourceCardListFooterCtrl, 'setListPagination');
    ctrl.$onInit();
    expect(resourceCardListFooterCtrl.setListPagination).toHaveBeenCalledWith(ctrl);
  });
});
