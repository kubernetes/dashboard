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
class ResourceCardListFilterController {
  /**
   * @param {!../../dataselect/service.DataSelectService} kdDataSelectService
   * @param {!../../errorhandling/dialog.ErrorDialog} errorDialog
   * @param {!angular.JQLite} $element
   * @param {!angular.$timeout} $timeout
   * @ngInject
   */
  constructor(kdDataSelectService, errorDialog, $element, $timeout) {
    /**
     * @export {!./resourcecardlist_component.ResourceCardListController} -
     * Initialized from require just before $onInit is called.
     */
    this.resourceCardListCtrl;
    /** @private {!../../dataselect/service.DataSelectService} */
    this.dataSelectService_ = kdDataSelectService;
    /** @private {!../../errorhandling/dialog.ErrorDialog} */
    this.errorDialog_ = errorDialog;
    /** @export {string} */
    this.inputText = '';
    /**
     * @private {string} - Unique data select id. Initialized from resource card list controller.
     */
    this.selectId_;
    /** @export */
    this.i18n = i18n;
    /** @private - Indicates whether search input should be shown or not */
    this.hidden_ = true;
    /** @private {!angular.JQLite} */
    this.element_ = $element;
    /** @private {!angular.$timeout} */
    this.timeout_ = $timeout;
  }

  /** @export */
  $onInit() {
    this.selectId_ = this.resourceCardListCtrl.selectId;

    if (!this.dataSelectService_.isRegistered(this.selectId_)) {
      this.dataSelectService_.registerInstance(this.selectId_);
    }
  }

  /**
   * @export
   * @return {boolean}
   */
  shouldEnable() {
    return this.selectId_ !== undefined && this.selectId_.length > 0 &&
        this.resourceCardListCtrl.list !== undefined &&
        this.resourceCardListCtrl.listResource !== undefined;
  }

  /**
   * @export
   * @return {boolean}
   */
  isSearchVisible() {
    return !this.hidden_;
  }

  /** @export */
  switchSearchVisibility() {
    this.hidden_ = !this.hidden_;

    if (!this.hidden_) {
      this.focusInput();
    }
  }

  /** @export */
  focusInput() {
    // Small timeout is required as input is not yet rendered when method is fired right after
    // clicking on filter button.
    this.timeout_(() => {
      this.element_.find('input')[0].focus();
    }, 150);
  }

  /** @export */
  clearInput() {
    this.switchSearchVisibility();
    // Do not call backend if it is not needed
    if (this.inputText.length > 0) {
      this.inputText = '';
      this.onTextUpdate();
    }
  }

  /** @export */
  onTextUpdate() {
    this.resourceCardListCtrl.setPending(true);

    let promise = this.dataSelectService_.filter(
        this.resourceCardListCtrl.listResource, this.selectId_, this.inputText);

    promise
        .then((list) => {
          this.resourceCardListCtrl.list = list;
          this.resourceCardListCtrl.setPending(false);
        })
        .catch((err) => {
          this.errorDialog_.open(this.i18n.MSG_RESOURCE_CARD_LIST_FILTERING_ERROR, err.data);
          this.resourceCardListCtrl.setPending(false);
        });
  }

  /**
   * @export
   * @return {string}
   */
  getTooltipMessage() {
    /**
     * @type {string} @desc Tooltip on resource card list filter icon.
     */
    let MSG_RESOURCE_CARD_LIST_FILTER_ICON_TOOLTIP = goog.getMsg('Filter objects by name');
    return MSG_RESOURCE_CARD_LIST_FILTER_ICON_TOOLTIP;
  }

  /**
   * @export
   * @return {string}
   */
  getPlaceholderText() {
    /**
     * @type {string} @desc Tooltip on resource card list filter icon.
     */
    let MSG_RESOURCE_CARD_LIST_FILTER_PLACEHOLDER_TEXT = goog.getMsg('Search');
    return MSG_RESOURCE_CARD_LIST_FILTER_PLACEHOLDER_TEXT;
  }
}

/**
 * Resource card list filter component. See resource card for documentation.
 * @type {!angular.Component}
 */
export const resourceCardListFilterComponent = {
  templateUrl: 'common/components/resourcecard/resourcecardlistfilter.html',
  controller: ResourceCardListFilterController,
  require: {
    'resourceCardListCtrl': '^kdResourceCardList',
    // Make sure that filtering can be only placed in a header
    'resourceCardListHeader': '^^kdResourceCardListHeader',
  },
};

const i18n = {
  /** @export {string} @desc Message shown to the user when there is a filtering error. */
  MSG_RESOURCE_CARD_LIST_FILTERING_ERROR: goog.getMsg('Filtering error'),
};
