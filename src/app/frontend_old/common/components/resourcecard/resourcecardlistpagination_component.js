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
 * @final
 */
export class ResourceCardListPaginationController {
  /**
   * @param {!../../dataselect/service.DataSelectService} kdDataSelectService
   * @param {!../../errorhandling/dialog.ErrorDialog} errorDialog
   * @ngInject
   */
  constructor(kdDataSelectService, kdSettingsService, errorDialog) {
    /**
     * @export {!./resourcecardlist_component.ResourceCardListController} -
     * Initialized from require just before $onInit is called.
     */
    this.resourceCardListCtrl;
    /** @private {!../../dataselect/service.DataSelectService} */
    this.dataSelectService_ = kdDataSelectService;

    this.settingsService_ = kdSettingsService;

    /** @private {!../../errorhandling/dialog.ErrorDialog} */
    this.errorDialog_ = errorDialog;
    /** @export */
    this.i18n = i18n;
    /** @export {string} - Unique data select id. Initialized from resource card list controller. */
    this.selectId;
  }

  /** @export **/
  $onInit() {
    this.selectId = this.resourceCardListCtrl.selectId;

    if (this.shouldEnablePagination() &&
        (this.resourceCardListCtrl.list === undefined ||
         this.resourceCardListCtrl.listResource === undefined)) {
      throw new Error('List and list resource have to be set on list card.');
    }

    if (!this.dataSelectService_.isRegistered(this.selectId)) {
      this.dataSelectService_.registerInstance(this.selectId);
    }
  }

  /** @export */
  shouldEnablePagination() {
    return this.selectId !== undefined && this.selectId.length > 0;
  }

  /**
   * Returns true if number of items on the list is bigger
   * then min available rows limit, false otherwise.
   *
   * @return {boolean}
   * @export
   */
  shouldShowPagination() {
    return this.resourceCardListCtrl.list.listMeta.totalItems >
        this.settingsService_.getItemsPerPage() &&
        this.shouldEnablePagination();
  }

  /**
   * Fetches pods based on given page number.
   *
   * @param {number} newPageNumber
   * @export
   */
  pageChanged(newPageNumber) {
    let dataSelectQuery =
        this.dataSelectService_.newDataSelectQueryBuilder().setPage(newPageNumber).build();

    let promise = this.dataSelectService_.paginate(
        this.resourceCardListCtrl.listResource, this.selectId, dataSelectQuery);

    this.resourceCardListCtrl.setPending(true);

    promise
        .then((list) => {
          this.resourceCardListCtrl.list = list;
          this.resourceCardListCtrl.setPending(false);
        })
        .catch((err) => {
          this.errorDialog_.open(this.i18n.MSG_RESOURCE_CARD_LIST_PAGINATION_ERROR, err.data);
          this.resourceCardListCtrl.setPending(false);
        });
  }
}

/**
 * Resource card list pagination component. Provides pagination component that displays
 * pagination on the given list of items.
 *
 * @type {!angular.Component}
 */
export const resourceCardListPaginationComponent = {
  templateUrl: 'common/components/resourcecard/resourcecardlistpagination.html',
  controller: ResourceCardListPaginationController,
  transclude: true,
  require: {
    'resourceCardListCtrl': '^kdResourceCardList',
    // Make sure that pagination can be only placed in a footer
    'resourceCardListFooter': '^^kdResourceCardListFooter',
  },
};

const i18n = {
  /** @export {string} @desc Message shown to the user when there is a pagination error. */
  MSG_RESOURCE_CARD_LIST_PAGINATION_ERROR: goog.getMsg('Pagination error'),
};
