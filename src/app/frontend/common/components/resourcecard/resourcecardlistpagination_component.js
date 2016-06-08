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
export class ResourceCardListPaginationController {
  /**
   * @ngInject
   */
  constructor() {
    /** @export {!./resourcecardlistfooter_component.ResourceCardListFooterController} -
     * Initialized from require just before $onInit is called. */
    this.resourceCardListFooterCtrl;
    /** @export {number} - Total number of items that need pagination */
    this.totalItems;
    /** @export {string} - Unique pagination id. Used together with id on <dir-paginate>
     *  directive */
    this.paginationId;
  }

  /**
   * @export
   */
  $onInit() { this.resourceCardListFooterCtrl.setListPagination(this); }
}

/**
 * Resource card list pagination component. Provides pagination component that displays
 * pagination on the given list of items.
 *
 * PaginationdId should always be set in order to differentiate between other pagination
 * components on the same page.
 *
 * @type {!angular.Component}
 */
export const resourceCardListPaginationComponent = {
  templateUrl: 'common/components/resourcecard/resourcecardlistpagination.html',
  controller: ResourceCardListPaginationController,
  transclude: true,
  require: {
    'resourceCardListFooterCtrl': '^kdResourceCardListFooter',
  },
  bindings: {
    'paginationId': '@',
    'totalItems': '<',
  },
};
