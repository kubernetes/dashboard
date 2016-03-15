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

/**
 * @final
 */
export default class LabelsController {
  /**
   * Constructs labels controller.
   * @ngInject
   */
  constructor() {
    /** @export {!Object<string, string>} Initialized from the scope. */
    this.labels;

    /** @type {boolean} */
    this.isShowingAllLabels = false;

    /** @type {number} */
    this.alwaysVisibleLabelsNumber = 8;
  }

  /**
   * Returns true if element at index position should be visible.
   *
   * @param index
   * @return {boolean}
   * @export
   */
  isVisible(index) { return this.isShowingAllLabels || index < this.alwaysVisibleLabelsNumber; }

  /**
   * Returns true if more labels than alwaysVisibleLabelsNumber is available.
   *
   * @return {boolean}
   * @export
   */
  isMoreAvailable() { return Object.keys(this.labels).length > this.alwaysVisibleLabelsNumber; }

  /**
   * Returns true if all labels are showed.
   *
   * @return {boolean}
   * @export
   */
  isShowingAll() { return this.isShowingAllLabels; }

  /**
   * Switches labels view between two states, which are showing only alwaysVisibleLabelsNumber of
   * labels and showing all labels.
   *
   * @export
   */
  switchLabelsView() { this.isShowingAllLabels = !this.isShowingAllLabels; }
}
