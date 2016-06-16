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
  constructor(kdPaginationService) {
    /** @export {!./resourcecardlistfooter_component.ResourceCardListFooterController} -
     * Initialized from require just before $onInit is called. */
    this.resourceCardListFooterCtrl;
    /** @export {number} - Total number of items that need pagination */
    this.totalItems;
    /** @export {string} - Unique pagination id. Used together with id on <dir-paginate>
     *  directive */
    this.paginationId;
    /** @private {!../../pagination/pagination_service.PaginationService} */
    this.paginationService_ = kdPaginationService;
    /** @export {number} */
    this.rowsLimit;
    /** @export {!Array<number>} */
    this.rowsLimitOptions = this.paginationService_.getRowsLimitOptions();
    /** @export */
    this.i18n = i18n;
  }

  /**
   * @export
   */
  $onInit() {
    if (this.paginationId === undefined || this.paginationId.length === 0) {
      throw new Error('Pagination id has to be set.');
    }

    if (!this.paginationService_.isRegistered(this.paginationId)) {
      this.paginationService_.registerInstance(this.paginationId);
    }

    this.resourceCardListFooterCtrl.setListPagination(this);
    this.rowsLimit = this.paginationService_.getRowsLimit(this.paginationId);
  }

  /**
   * Updates number of rows to display on associated resource list.
   * @export
   */
  onRowsLimitUpdate() { this.paginationService_.setRowsLimit(this.rowsLimit, this.paginationId); }

  /**
   * Returns true if number of items on the list is bigger
   * then min available rows limit, false otherwise.
   *
   * @return {boolean}
   * @export
   */
  shouldShowPagination() { return this.totalItems > this.paginationService_.getMinRowsLimit(); }
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

const i18n = {
  /** @export {string} @desc Label for pagination rows selector visible on resource lists. */
  MSG_RESOURCE_CARD_LIST_PAGINATION_ROW_SELECTOR_LABEL: goog.getMsg('Rows per page'),
};
