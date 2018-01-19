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

import {size} from './resourcecardcolumnsizer';

/**
 * Controller for the resource card component. See resource card list for documentation.
 * @final
 */
export class ResourceCardHeaderColumnsController {
  constructor() {
    /**
     * Initialized from require just before $onInit is called.
     * @export {!./resourcecardlist_component.ResourceCardListController}
     */
    this.resourceCardListCtrl;

    /**
     * @private {!Array<!./resourcecardheadercolumn_component.ResourceCardHeaderColumnController>}
     */
    this.columns_ = [];
  }

  /**
   * @export
   */
  $onInit() {
    this.resourceCardListCtrl.setHeaderColumns(this);
  }

  /**
   * @export
   */
  reset() {
    this.columns_.forEach((column) => {
      if (column.isSortable()) {
        column.reset();
      }
    });
  }

  /**
   * @param {!./resourcecardheadercolumn_component.ResourceCardHeaderColumnController} columnCtrl
   * @param {!angular.JQLite} columnElement
   */
  addAndSizeHeaderColumn(columnCtrl, columnElement) {
    size(columnElement, columnCtrl.size, columnCtrl.grow);
    this.columns_.push(columnCtrl);
  }

  /**
   * @param {!angular.JQLite} columnElement
   * @param {number} index
   */
  sizeBodyColumn(columnElement, index) {
    if (this.columns_.length <= index) {
      throw new Error(
          'Not enough header columns registered. ' +
          'Try adding kd-resource-card-header-column to the list.');
    }
    size(columnElement, this.columns_[index].size, this.columns_[index].grow);
  }
}

/**
 * Resource card header columns component. See resource card list for documentation.
 * @type {!angular.Component}
 */
export const resourceCardHeaderColumnsComponent = {
  templateUrl: 'common/components/resourcecard/resourcecardheadercolumns.html',
  transclude: true,
  require: {
    'resourceCardListCtrl': '^kdResourceCardList',
  },
  controller: ResourceCardHeaderColumnsController,
};
