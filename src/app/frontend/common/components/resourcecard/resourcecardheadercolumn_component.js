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
 * Controller for the resource card component.
 * @final
 */
export class ResourceCardHeaderColumnController {
  /**
   * @param {!angular.JQLite} $element
   * @ngInject
   */
  constructor($element) {
    /**
     * Initialized from require just before $onInit is called.
     * @export {!./resourcecardheadercolumns_component.ResourceCardHeaderColumnsController}
     */
    this.resourceCardHeaderColumnsCtrl;

    /**
     * Initialized from a binding.
     * @export {string|undefined}
     */
    this.size;

    /**
     * Initialized from a binding.
     * @export {string|undefined}
     */
    this.grow;

    /** @private {!angular.JQLite} */
    this.element_ = $element;
  }

  /**
   * @export
   */
  $onInit() {
    this.resourceCardHeaderColumnsCtrl.addAndSizeHeaderColumn(this, this.element_);
  }
}

/**
 * Resource card column component. See resource card for documentation.
 * @type {!angular.Component}
 */
export const resourceCardHeaderColumnComponent = {
  templateUrl: 'common/components/resourcecard/resourcecardheadercolumn.html',
  transclude: true,
  bindings: {
    'size': '@',
    'grow': '@',
  },
  bindToController: true,
  require: {
    'resourceCardHeaderColumnsCtrl': '^kdResourceCardHeaderColumns',
  },
  controller: ResourceCardHeaderColumnController,
};
