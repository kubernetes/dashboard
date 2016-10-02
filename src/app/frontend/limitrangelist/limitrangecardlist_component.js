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
 * Controller for limit range card list.
 *
 * @final
 */
export class LimitRangeCardListController {
  /**
   * @param {!./../common/namespace/namespace_service.NamespaceService} kdNamespaceService
   * @ngInject
   */
  constructor(kdNamespaceService) {
    /** @private {!./../common/namespace/namespace_service.NamespaceService} */
    this.kdNamespaceService_ = kdNamespaceService;

    /** @export */
    this.i18n = i18n;
  }

  /**
   * @return {boolean}
   * @export
   */
  areMultipleNamespacesSelected() {
    return this.kdNamespaceService_.areMultipleNamespacesSelected();
  }
}

/**
 * @return {!angular.Component}
 */
export const limitRangeCardListComponent = {
  transclude: true,
  controller: LimitRangeCardListController,
  bindings: {
    'limitRangeList': '<',
    'limitRangeListResource': '<',
  },
  templateUrl: 'limitrangelist/limitrangecardlist.html',
};

const i18n = {
  /** @export {string} @desc Limit range list header: name. */
  MSG_LIMIT_RANGE_LIST_HEADER_NAME: goog.getMsg('Name'),
  /** @export {string} @desc Limit range list header: namespace. */
  MSG_LIMIT_RANGE_LIST_NAMESPACE_LABEL: goog.getMsg('Namespace'),
  /** @export {string} @desc Limit range list header: age. */
  MSG_LIMIT_RANGE_LIST_HEADER_AGE: goog.getMsg('Age'),
};
