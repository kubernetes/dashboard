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

import {SortableProperties} from '../../dataselect/builder';

/**
 * Controller for the resource card component.
 * @final
 */
export class ResourceCardHeaderColumnController {
  /**
   * @param {!angular.JQLite} $element
   * @param {!../../dataselect/service.DataSelectService} kdDataSelectService
   * @param {!../../errorhandling/dialog.ErrorDialog} errorDialog
   * @ngInject
   */
  constructor($element, kdDataSelectService, errorDialog) {
    /**
     * Initialized from require just before $onInit is called.
     * @export {!./resourcecardheadercolumns_component.ResourceCardHeaderColumnsController}
     */
    this.resourceCardHeaderColumnsCtrl;
    /**
     * Initialized from require just before $onInit is called.
     * @export {!./resourcecardlist_component.ResourceCardListController}
     */
    this.resourceCardListCtrl;
    /** @export {string|undefined} - - Initialized from a binding. */
    this.size;
    /** @export {string|undefined} - - Initialized from a binding. */
    this.grow;
    /** @export {boolean|undefined} - Initialized from a binding. */
    this.sortable;
    /** @export {string} - Initialized from a binding. */
    this.sortId;
    /** @private {boolean|undefined} */
    this.ascending_;
    /** @private {!angular.JQLite} */
    this.element_ = $element;
    /** @private {!../../dataselect/service.DataSelectService} kdDataSelectService */
    this.dataSelectService_ = kdDataSelectService;
    /** @export {string} - Unique data select id. Initialized from resource card list controller. */
    this.selectId;
    /** @private {!../../errorhandling/dialog.ErrorDialog} */
    this.errorDialog_ = errorDialog;
    /** @export */
    this.i18n = i18n;
  }

  /** @export */
  $onInit() {
    this.selectId = this.resourceCardListCtrl.selectId;
    this.resourceCardHeaderColumnsCtrl.addAndSizeHeaderColumn(this, this.element_);

    // If column is sortable but required resources are not provided then disable sorting support
    if (this.isSortable() &&
        (this.resourceCardListCtrl.list === undefined ||
         this.resourceCardListCtrl.listResource === undefined)) {
      this.sortable = false;
    }

    // Initialize default sort for AGE column
    if (this.isSortable() && this.sortId === SortableProperties.AGE) {
      this.ascending_ = true;
    }
  }

  /** @export */
  shouldEnableSorting() {
    return this.selectId !== undefined && this.selectId.length > 0 && this.isSortable();
  }

  /**
   * @return {boolean}
   * @export
   */
  isAscending() {
    return this.ascending_ !== undefined && this.ascending_;
  }

  /**
   * @return {boolean}
   * @export
   */
  isDescending() {
    return this.isSorted() && !this.isAscending();
  }

  /**
   * @return {boolean}
   * @export
   */
  isSorted() {
    return this.ascending_ !== undefined;
  }

  /**
   * @export
   */
  reset() {
    this.ascending_ = undefined;
  }

  /**
   * @return {boolean|undefined}
   * @export
   */
  isSortable() {
    return this.sortable;
  }

  /**
   * @export
   */
  sort() {
    let asc = !this.ascending_;
    this.resourceCardHeaderColumnsCtrl.reset();
    this.ascending_ = asc;

    let promise = this.dataSelectService_.sort(
        this.resourceCardListCtrl.listResource, this.selectId, asc, this.sortId);

    this.resourceCardListCtrl.setPending(true);

    promise
        .then((list) => {
          this.resourceCardListCtrl.list = list;
          this.resourceCardListCtrl.setPending(false);
        })
        .catch((err) => {
          this.errorDialog_.open(this.i18n.MSG_RESOURCE_CARD_LIST_SORT_ERROR, err.data);
          this.resourceCardListCtrl.setPending(false);
        });
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
    'sortable': '@',
    'sortId': '<',
  },
  bindToController: true,
  require: {
    'resourceCardHeaderColumnsCtrl': '^kdResourceCardHeaderColumns',
    'resourceCardListCtrl': '^^kdResourceCardList',
  },
  controller: ResourceCardHeaderColumnController,
};

const i18n = {
  /** @export {string} @desc Message shown to the user when there is a sort error. */
  MSG_RESOURCE_CARD_LIST_SORT_ERROR: goog.getMsg('Sort error'),
};
