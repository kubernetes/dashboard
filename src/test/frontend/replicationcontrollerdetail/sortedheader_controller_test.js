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

import SortedHeaderController from 'replicationcontrollerdetail/sortedheader_controller';
import {UPWARDS, DOWNWARDS} from 'replicationcontrollerdetail/sortedheader_controller';

describe('Sorted header controller', () => {
  /**
   * Sorted header controller.
   * @type {!SortedHeaderController}
   */
  let ctrl;

  beforeEach(() => { ctrl = new SortedHeaderController(); });

  it('should switch sorting direction after clicking same column twice', () => {
    // given "selected-column" is sorted upwards
    ctrl.currentlySelectedOrder = UPWARDS;
    ctrl.currentlySelectedColumn = "selected-column";
    ctrl.columnName = "selected-column";

    // when user clicks "selected-column" once more
    ctrl.changeSorting();

    // then it should be sorted downwards
    expect(ctrl.currentlySelectedColumn).toEqual(ctrl.columnName);
    expect(ctrl.currentlySelectedOrder).toEqual(DOWNWARDS);
    expect(ctrl.isArrowUp()).toEqual(false);
    expect(ctrl.isArrowDown()).toEqual(true);
  });

  it('should switch sorting column after clicking second column', () => {
    // given "first-column", however sorting is on "second-column"
    ctrl.columnName = "first-column";
    ctrl.currentlySelectedOrder = UPWARDS;
    ctrl.currentlySelectedColumn = "second-column";

    // when user clicks "first-column"
    ctrl.changeSorting();

    // then it should be sorted by "first-column" upwards
    expect(ctrl.currentlySelectedColumn).toEqual(ctrl.columnName);
    expect(ctrl.currentlySelectedOrder).toEqual(UPWARDS);
    expect(ctrl.isArrowUp()).toEqual(true);
    expect(ctrl.isArrowDown()).toEqual(false);
  });
});
