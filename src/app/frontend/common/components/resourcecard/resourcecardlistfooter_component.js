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
export class ResourceCardListFooterController {
  /**
   * @param {!../../pagination/pagination_service.PaginationService} kdPaginationService
   * @param {!angular.$transclude} $transclude TODO(floreks) fix this when externs are fixed
   * @ngInject
   */
  constructor(kdPaginationService, $transclude) {
    /** @private {!./resourcecardlistpagination_component.ResourceCardListPaginationController} -
     *  Initialized in ResourceCardListPaginationController in $onInit method */
    this.listPagination_;
    /** @private {!../../pagination/pagination_service.PaginationService} */
    this.paginationService_ = kdPaginationService;
    /** @private {Object} */
    this.transclude_ = $transclude;
  }

  /**
   * @param {!./resourcecardlistpagination_component.ResourceCardListPaginationController}
   * listPagination
   * @export
   */
  setListPagination(listPagination) {
    if (this.listPagination_) {
      throw new Error('List pagination controller already set.');
    }

    this.listPagination_ = listPagination;
  }

  /**
   * Returns true if pagination slot has been filled and number of items on the list is bigger
   * then min available rows limit, false otherwise.
   *
   * @return {boolean}
   * @private
   */
  shouldShowPagination_() {
    return this.listPagination_ &&
        this.listPagination_.totalItems > this.paginationService_.getMinRowsLimit();
  }

  /**
   * Returns true if footer content slot has been filled or pagination should be displayed on
   * the footer, false otherwise.
   *
   * @return {boolean}
   * @export
   */
  shouldShowFooter() {
    return this.transclude_.isSlotFilled('content') || this.shouldShowPagination_();
  }
}

/**
 * Resource card list footer component. Provides footer to display some additional data, i.e.
 * pagination component.
 *
 * @type {!angular.Component}
 */
export const resourceCardListFooterComponent = {
  templateUrl: 'common/components/resourcecard/resourcecardlistfooter.html',
  controller: ResourceCardListFooterController,
  transclude: /** @type {undefined} TODO: Remove this when externs are fixed */ ({
    'content': '?kdResourceCardListFooterContent',
    'pagination': '?kdResourceCardListPagination',
  }),
  require: {
    'resourceCardListCtrl': '^kdResourceCardList',
  },
};
