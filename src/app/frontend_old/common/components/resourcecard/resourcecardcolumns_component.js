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

/**
 * Controller for the resource card component.
 * @final
 */
export class ResourceCardColumnsController {
  /**
   * @ngInject
   */
  constructor() {
    /**
     * Initialized from require just before $onInit is called.
     * @export {!./resourcecardlist_component.ResourceCardListController}
     */
    this.resourceCardListCtrl;

    /** @private {number} */
    this.numColumnsAdded_ = 0;

    /** @private {boolean} whether the $onInit component phase has finished */
    this.initialized_ = false;
  }

  /**
   * @export
   */
  $onInit() {
    this.initialized_ = true;
  }

  /**
   * @param {!angular.JQLite} columnElement
   */
  addAndSizeColumn(columnElement) {
    if (!this.initialized_) {
      throw new Error('Resource card columns component must be initialized before adding columns');
    }
    this.resourceCardListCtrl.sizeBodyColumn(columnElement, this.numColumnsAdded_);
    this.numColumnsAdded_ += 1;
  }
}

/**
 * Resource card columns component. See resource card for documentation.
 * @type {!angular.Component}
 */
export const resourceCardColumnsComponent = {
  templateUrl: 'common/components/resourcecard/resourcecardcolumns.html',
  transclude: true,
  require: {
    'resourceCardListCtrl': '^kdResourceCardList',
  },
  controller: ResourceCardColumnsController,
};
