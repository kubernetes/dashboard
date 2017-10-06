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
export class ResourceCardColumnController {
  /**
   * @param {!angular.JQLite} $element
   * @ngInject
   */
  constructor($element) {
    /**
     * Initialized from require just before $onInit is called.
     * @export {!./resourcecardcolumns_component.ResourceCardColumnsController}
     */
    this.resourceCardColumnsCtrl;

    /** @private {!angular.JQLite} */
    this.element_ = $element;
  }

  /**
   * @export
   */
  $onInit() {
    this.resourceCardColumnsCtrl.addAndSizeColumn(this.element_);
  }
}

/**
 * Resource card column component. See resource card for documentation.
 * @type {!angular.Component}
 */
export const resourceCardColumnComponent = {
  templateUrl: 'common/components/resourcecard/resourcecardcolumn.html',
  transclude: true,
  require: {
    'resourceCardColumnsCtrl': '^kdResourceCardColumns',
  },
  controller: ResourceCardColumnController,
};
