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
   * @param {!../../pagination/pagination_service.PaginationService} kdPaginationService
   * @param {!./../../../chrome/chrome_state.StateParams} $stateParams
   */
  constructor(kdPaginationService, $stateParams) {
    /** @export {!./resourcecardlistfooter_component.ResourceCardListFooterController} -
     * Initialized from require just before $onInit is called. */
    this.resourceCardListFooterCtrl;
    /** @export {string} - Unique pagination id. Used together with id on <dir-paginate>
        directive. Initialized from binding. */
    this.paginationId;
    /** @export {*} Initialized from binding. TODO add type */
    this.listFactory;
    /** @export {*} Initialized from binding. TODO add type */
    this.list;
    /** @private {!../../pagination/pagination_service.PaginationService} */
    this.paginationService_ = kdPaginationService;
    /** @private {!./../../../chrome/chrome_state.StateParams} */
    this.stateParams_ = $stateParams;
    /** @export {number} */
    this.rowsLimit;
    /** @export {!Array<number>} */
    this.rowsLimitOptions = this.paginationService_.getRowsLimitOptions();
    /** @export {boolean} - Indicates whether pagination should be server sided of frontend only. */
    this.serverSided = true;
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

    if (this.listFactory === undefined) {
      this.serverSided = false;
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
  shouldShowPagination() {
    return this.list.listMeta.totalItems > this.paginationService_.getMinRowsLimit();
  }

  /**
   * Fetches pods based on given page number.
   *
   * @param {number} newPageNumber
   * @export
   */
  pageChanged(newPageNumber) {
    /** @type {*} TODO set type */
    this.list = this.listFactory.get({
      namespace: this.stateParams_.namespace || '',
      itemsPerPage: this.paginationService_.getRowsLimit(this.paginationId),
      page: newPageNumber,
    });
  }
}

/**
 * Resource card list pagination component. Provides pagination component that displays
 * pagination on the given list of items.
 *
 * Bindings:
 *  - paginationId (required): Should always be set in order to differentiate between other
 *    pagination components on the same page.
 *  - list (required): List of resources that should be paginated.
 *  - listFactory (optional): Factory used to get paginated list of object from the server.
 *    If listFactory is not set, then only frontend pagination is provided.
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
    'listFactory': '<',
    'list': '=',
  },
};

const i18n = {
  /** @export {string} @desc Label for pagination rows selector visible on resource lists. */
  MSG_RESOURCE_CARD_LIST_PAGINATION_ROW_SELECTOR_LABEL: goog.getMsg('Rows per page'),
};
