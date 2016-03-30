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
 * Sorting order variable. Represents ascending order.
 * @type {boolean}
 */
export const UPWARDS = false;

/**
 * Sorting order variable. Represents descending order.
 * @type {boolean}
 */
export const DOWNWARDS = true;

/**
 * Controller for the sorted header directive.
 * @final
 */
export default class SortedHeaderController {
  /**
   * @ngInject
   */
  constructor() {
    /**
     * Tooltip message for current header column. Initialized from the scope (read-only).
     * @export {string}
     */
    this.tooltip;

    /**
     * Name of current header column. Must match at least one of sorted object members. Initialized
     * from the scope (read-only).
     * @export {string}
     */
    this.columnName;

    /**
     * Name of column currently used for sorting. Initialized from the scope (two-way binding).
     * @export {string}
     */
    this.currentlySelectedColumn;

    /**
     * If true then sorting will be reversed. Initialized from the scope (two-way binding).
     * @export {boolean}
     */
    this.currentlySelectedOrder;
  }

  /**
   * Applies sorting on current column of the table. If sorting on specific column was already
   * applied only order will be switched.
   * @export
   */
  changeSorting() {
    this.currentlySelectedOrder =
        (this.currentlySelectedColumn === this.columnName) ? !this.currentlySelectedOrder : false;
    this.currentlySelectedColumn = this.columnName;
  }

  /**
   * Returns true if upwards arrow should be displayed in the header.
   * @return {boolean}
   * @export
   */
  isArrowUp() { return this.isSortedBy_(this.columnName, UPWARDS); }

  /**
   * Returns true if downwards arrow should be displayed in the header.
   * @return {boolean}
   * @export
   */
  isArrowDown() { return this.isSortedBy_(this.columnName, DOWNWARDS); }

  /**
   * Used to determine which arrow should be displayed in header. Returns true if sorting on
   * specific column and in specific order of the table is currently applied.
   * @param {string} sortColumn
   * @param {boolean} sortOrder
   * @return {boolean}
   * @private
   */
  isSortedBy_(sortColumn, sortOrder) {
    return this.currentlySelectedColumn === sortColumn && this.currentlySelectedOrder === sortOrder;
  }

  /**
   * Checks if header tooltip is available.
   * @return {boolean}
   * @export
   */
  isTooltipAvailable() { return this.tooltip !== undefined && this.tooltip.length > 0; }
}
