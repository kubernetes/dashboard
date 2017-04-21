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
class ResourceCardListFilterController {
  /** @ngInject */
  constructor(kdDataSelectService, errorDialog) {
    /** @export {!./resourcecardlist_component.ResourceCardListController} -
     * Initialized from require just before $onInit is called. */
    this.resourceCardListCtrl;
    /** @private {!../../dataselect/service.DataSelectService} */
    this.dataSelectService_ = kdDataSelectService;
    /** @private {!../../errorhandling/service.ErrorDialog} */
    this.errorDialog_ = errorDialog;
    /** @export {string} */
    this.inputText = '';
    /** @private {string} - Unique data select id. Initialized from resource card list controller. */
    this.selectId_;
    /** @export */
    this.i18n = i18n;
  }

  /** @export */
  $onInit() {
    this.selectId_ = this.resourceCardListCtrl.selectId;

    if (this.shouldEnable() &&
        (this.resourceCardListCtrl.list === undefined ||
         this.resourceCardListCtrl.listResource === undefined)) {
      throw new Error('List and list resource have to be set on list card.');
    }

    if (!this.dataSelectService_.isRegistered(this.selectId_)) {
      this.dataSelectService_.registerInstance(this.selectId_);
    }
  }

  shouldEnable() {
    return this.selectId_ !== undefined && this.selectId_.length > 0;
  }

  /**
   * @export
   * @return {boolean}
   */
  shouldKeepSearchOpen() {
    return this.inputText.length > 0;
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
    // Make sure that pagination can be only placed in a footer
    'resourceCardListHeader': '^^kdResourceCardListHeader',
  },
};

const i18n = {
  /** @export {string} @desc Message shown to the user when there is a filtering error. */
  MSG_RESOURCE_CARD_LIST_FILTERING_ERROR: goog.getMsg('Filtering error'),
};
