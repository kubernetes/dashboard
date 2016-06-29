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

import {PaginationService} from 'common/pagination/pagination_service';

/**
 * @final
 */
export class ResourceCardListPaginationController {
  /**
   * @ngInject
   * @param {!../../pagination/pagination_service.PaginationService} kdPaginationService
   * @param {!../../../chrome/chrome_state.StateParams} $stateParams
   * @param {!../../errorhandling/errordialog_service.ErrorDialog} errorDialog
   * @param {!angular.Scope} $scope
   */
  constructor(kdPaginationService, $stateParams, errorDialog, $scope) {
    /** @export {!./resourcecardlistfooter_component.ResourceCardListFooterController} -
     * Initialized from require just before $onInit is called. */
    this.resourceCardListFooterCtrl;
    /** @export {string} - Unique pagination id. Used together with id on <dir-paginate>
     directive. Initialized from binding. */
    this.paginationId;
    /** @export {!angular.$resource} Initialized from binding. */
    this.listResource;
    /** @export {{listMeta: !backendApi.ListMeta}} Initialized from binding. */
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
    /** @private {!../../errorhandling/errordialog_service.ErrorDialog} */
    this.errorDialog_ = errorDialog;
    /** @private {!angular.Scope} */
    this.scope_ = $scope;
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

    if (this.listResource === undefined) {
      this.serverSided = false;
    }

    if (!this.paginationService_.isRegistered(this.paginationId)) {
      this.paginationService_.registerInstance(this.paginationId);
    }

    this.resourceCardListFooterCtrl.setListPagination(this);
    this.rowsLimit = this.paginationService_.getRowsLimit(this.paginationId);
    this.registerStateChangeListener(this.scope_);
  }

  /**
   * @param {!angular.Scope} scope
   */
  registerStateChangeListener(scope) {
    scope.$on('$stateChangeStart', () => this.paginationService_.resetRowsLimit());
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
    let query = PaginationService.getResourceQuery(
        this.paginationService_.getRowsLimit(this.paginationId), newPageNumber,
        this.stateParams_.namespace);

    this.listResource.get(
        query, (list) => { this.list = list; },
        (err) => { this.errorDialog_.open('Pagination error', err); });
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
 *  - listResource (optional): Angular resource used to get paginated list of objects from the
 *    server. If listResource is undefined, then only frontend pagination will be provided.
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
    'listResource': '<',
    'list': '=',
  },
};

const i18n = {
  /** @export {string} @desc Label for pagination rows selector visible on resource lists. */
  MSG_RESOURCE_CARD_LIST_PAGINATION_ROW_SELECTOR_LABEL: goog.getMsg('Rows per page'),
};
